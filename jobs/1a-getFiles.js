// Your job goes here.

query(
  "SELECT Title, Id, FirstPublishLocationId, IsLatest, FileExtension, FileType, PathOnClient, ContentModifiedDate, ContentUrl, Description, VersionData FROM ContentVersion WHERE (Title LIKE '%annual%' AND Title LIKE '%report%') OR (Title LIKE '%m&e%')"
);
alterState((state) => {
  const data = {
    files: state.references[0].records.map((i) => ({
      id: `${i.Id}/VersionData`,
      //   Adding these for next job
      fileExtension: i.FileExtension,
      projectName: "Breaking Barriers Karonga Project",
      folderName:
        i.Title.toLowerCase().includes("annual") &&
        i.Title.toLowerCase().includes("report")
          ? "Annual Reports"
          : "M&E",
    })),
  };
  return { ...state, data };
});
each(
  dataPath("files[*]"),
  retrieve("ContentVersion", dataValue("id"), (state) => {
    const blob = state.references[0];
    const file = { ...state.data, blob };
    // At this point I wanna post to OpenFn inbox
    return { ...state, data: file, references: [...state.references, file] };
  })
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