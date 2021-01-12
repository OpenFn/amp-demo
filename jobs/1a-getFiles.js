query(
  "SELECT Title, Id, FirstPublishLocationId, IsLatest, FileExtension, FileType, PathOnClient, ContentModifiedDate, ContentUrl, Description, VersionData FROM ContentVersion WHERE (Title LIKE '%annual%' AND Title LIKE '%report%') OR (Title LIKE '%m&e%')"
);
alterState(state => {
  const data = {
    files: state.references[0].records.filter(f => {
      const { lastModification } = state;
      if (lastModification) {
        // Only return files that have been updated AFTER the last time we checked.
        return f.ContentModifiedDate >= state.lastModification
      }
      return true;
    })
      .map(f => ({
        id: `${f.Id}/VersionData`,
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
each(
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

alterState(state => {
  // TODO: make this sort so that the last date shows up first.
  const lastModification = state.data.sort((a, b) => b.ContentModifiedDate - a.ContentModifiedDate)[0];
  return { ...state, lastModification, references: []}
  );
