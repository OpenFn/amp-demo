// Your job goes here.

query(
  "SELECT Title, FirstPublishLocationId, IsLatest, FileExtension, FileType, PathOnClient, ContentModifiedDate, ContentUrl, Description, VersionData FROM ContentVersion WHERE (Title LIKE '%annual%' AND Title LIKE '%report%') OR (Title LIKE '%m&e%')"
);

query(...getsomefiles);
alterState(state => {
  const files = state.references.filter(r => r.fileName === 'something')
  return { ...state, files }
});
each(
  '$.files[*]',
  alterState(state => {
    return axios.post(...).then(() => state);
  })
)