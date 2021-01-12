// Here we check for newly updated files in Amp
query(
  `SELECT Title, Id, FirstPublishLocationId, IsLatest, FileExtension, FileType, PathOnClient, ContentModifiedDate, ContentUrl, Description, VersionData FROM ContentVersion WHERE ContentModifiedDate > ${
    state.lastModification || '2021-01-01T00:00:00Z'
  } AND ((Title LIKE '%annual%' AND Title LIKE '%report%') OR (Title LIKE '%m&e%'))`
);

// Here we prepare some key information for the files.
alterState(state => {
  const data = {
    files: state.references[0].records.map(f => ({
      id: `${f.Id}/VersionData`,
      lastModified: f.ContentModifiedDate,
      fileName: f.Title,
      fileExtension: f.FileExtension,
      projectName: 'Breaking Barriers Karonga Project',
      folderName:
        f.Title.toLowerCase().includes('annual') &&
        f.Title.toLowerCase().includes('report')
          ? 'Annual Reports'
          : 'M&E',
    })),
  };
  return { ...state, data };
});

// Here we download each updated file and upsert it to Sharepoint
beta.each(
  dataPath('files[*]'),
  retrieve('ContentVersion', dataValue('id'), state => {
    const file = state.data;
    const blob = state.references[0];

    return axios
      .request(
        `https://login.microsoftonline.com/${state.configuration.tenant}/oauth2/v2.0/token`,
        {
          method: 'post',
          data: state.configuration.clientSecrets,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Host: 'login.microsoftonline.com',
          },
        }
      )
      .then(result => {
        const url = `https://graph.microsoft.com/v1.0/sites/openfn.sharepoint.com,848825d7-4e10-4ebd-867c-d3621d5c52d6,7294c260-9f2a-462b-bcd9-faf0e9c1f70f/drives/b!1yWIhBBOvU6GfNNiHVxS1mDClHIqnytGvNn68OnB9w9OBF3Wt6sIQ484NzClqrYF/root:/${file.projectName}/${file.folderName}/${file.fileName}.${file.fileExtension}:/content`;

        return axios.request(url, {
          method: 'put',
          data: blob,
          headers: {
            Authorization: 'Bearer ' + result.data.access_token,
          },
        });
      })
      .then(uploadResponse => {
        console.log('Res', uploadResponse);
        return state;
      });
  })
);

// Here, we set a cursor for use in the next run.
alterState(state => {
  const lastModification = state.data.files.sort().reverse()[0].lastModified;
  return { ...state, lastModification, references: [] };
});
