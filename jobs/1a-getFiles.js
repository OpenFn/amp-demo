query(
  "SELECT Title, FirstPublishLocationId, IsLatest, FileExtension, FileType, PathOnClient, ContentModifiedDate, ContentUrl, Description, VersionData FROM ContentVersion WHERE (Title LIKE '%annual%' AND Title LIKE '%report%') OR (Title LIKE '%m&e%')"
);
