import { useEffect, useState } from "react";
import api from "../api/axios";

function AttachmentSection({ taskId }) {
  const [attachments, setAttachments] = useState([]);
  const [file, setFile] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    api
      .get(`/attachments/task/${taskId}`)
      .then((res) => {
        if (isMounted) {
          setAttachments(res.data.attachments);
        }
      })
      .catch((err) => {
        console.log(err);
      });

    return () => {
      isMounted = false;
    };
  }, [taskId]);

  const fetchAttachments = async () => {
    try {
      const res = await api.get(`/attachments/task/${taskId}`);
      setAttachments(res.data.attachments);
    } catch (err) {
      console.log(err);
    }
  };

  const uploadAttachment = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("taskId", taskId);
    formData.append("file", file);

    try {
      setUploading(true);

      await api.post("/attachments", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setFile(null);
      setFileInputKey((currentKey) => currentKey + 1);
      await fetchAttachments();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const deleteAttachment = async (attachmentId) => {
    try {
      await api.delete(`/attachments/${attachmentId}`);

      if (
        attachments.find((attachment) => attachment._id === attachmentId)
          ?.fileUrl === previewUrl
      ) {
        setPreviewUrl("");
      }

      await fetchAttachments();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete file");
    }
  };

  const isImage = (attachment) =>
    attachment.fileType?.startsWith("image/");

  const downloadAttachment = async (attachment) => {
    try {
      const res = await api.get(
        `/attachments/${attachment._id}/download`,
        {
          responseType: "blob",
        }
      );

      const blobUrl = URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = blobUrl;
      link.download = attachment.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to download file");
    }
  };

  return (
    <div>
      <h2>Attachments</h2>

      <input
        key={fileInputKey}
        type="file"
        onChange={(e) => setFile(e.target.files[0] || null)}
      />

      <button
        onClick={uploadAttachment}
        disabled={!file || uploading}
        style={{ marginLeft: "10px" }}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {previewUrl && (
        <div style={{ marginTop: "20px" }}>
          <img
            src={previewUrl}
            alt="Attachment preview"
            className="attachment-preview"
            style={{
              maxWidth: "100%",
              maxHeight: "320px",
            }}
          />
        </div>
      )}

      <hr />

      {attachments.length === 0 ? (
        <p>No attachments yet.</p>
      ) : (
        attachments.map((attachment) => (
          <div
            className="attachment-row"
            key={attachment._id}
          >
            <strong>{attachment.fileName}</strong>

            <br />
            <br />

            {isImage(attachment) ? (
              <button onClick={() => setPreviewUrl(attachment.fileUrl)}>
                Preview
              </button>
            ) : (
              <button
                onClick={() => downloadAttachment(attachment)}
              >
                Download
              </button>
            )}

            <button
              onClick={() => deleteAttachment(attachment._id)}
              className="button-danger"
              style={{ marginLeft: "10px" }}
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default AttachmentSection;
