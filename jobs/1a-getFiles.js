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
    const file = state.data;
    let data = {
      ...file,
      blob: state.references[0],
    };
    return axios.request(state.configuration.inboxUrl, {
      method: "post",
      data: data,
    });
    // return { ...state, data: data, references: [...state.references, data] };
  })
);
