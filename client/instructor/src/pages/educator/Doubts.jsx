import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../../components/student/Loading";
import { fetchInstructorDoubts, replyInstructorDoubt } from "../../redux/slice/educatorSlice";
import { assets } from "../../assets/assets";

const Doubts = () => {
  const dispatch = useDispatch();
  const { doubts, doubtsLoaded, loading } = useSelector((state) => state.educator);
  const [replyById, setReplyById] = useState({});
  const [replyLoadingId, setReplyLoadingId] = useState("");

  useEffect(() => {
    dispatch(fetchInstructorDoubts()).then((result) => {
      if (fetchInstructorDoubts.rejected.match(result)) {
        toast.error(result.payload || "Failed to load doubts");
      }
    });
  }, [dispatch]);

  const handleReply = async (doubt) => {
    const reply = replyById[doubt._id]?.trim();
    if (!reply) {
      toast.error("Please write a reply");
      return;
    }

    setReplyLoadingId(doubt._id);
    const result = await dispatch(replyInstructorDoubt({ id: doubt._id, reply }));

    if (replyInstructorDoubt.fulfilled.match(result)) {
      toast.success(result.payload.message);
      setReplyById((current) => ({ ...current, [doubt._id]: "" }));
    } else {
      toast.error(result.payload || "Failed to reply");
    }

    setReplyLoadingId("");
  };

  if (!doubtsLoaded || loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen md:p-8 p-4 pt-8">
      <h2 className="pb-4 text-lg font-medium">Student Doubts</h2>
      {doubts.length === 0 ? (
        <div className="max-w-4xl w-full rounded-md bg-white border border-gray-500/20 p-8 text-center">
          <p className="text-lg font-medium text-gray-700">No doubts yet</p>
          <p className="mt-2 text-sm text-gray-500">Student questions will appear here.</p>
        </div>
      ) : (
        <div className="max-w-5xl w-full space-y-4">
          {doubts.map((doubt) => (
            <div key={doubt._id} className="bg-white border border-gray-500/20 rounded-md p-4">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={doubt.student?.imageUrl || assets.profile_img}
                    alt="student"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-800">{doubt.student?.name || "Student"}</p>
                    <p className="text-sm text-gray-500">{doubt.course?.courseTitle || "Course"}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium w-max ${doubt.status === "answered" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  {doubt.status}
                </span>
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700">Question</p>
                <p className="mt-1 text-gray-600">{doubt.question}</p>
              </div>

              {doubt.reply && (
                <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded p-3">
                  <p className="text-sm font-medium text-indigo-800">Your Reply</p>
                  <p className="mt-1 text-sm text-indigo-700">{doubt.reply}</p>
                </div>
              )}

              <div className="mt-4">
                <textarea
                  value={replyById[doubt._id] || ""}
                  onChange={(event) => setReplyById((current) => ({ ...current, [doubt._id]: event.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={doubt.reply ? "Update your reply..." : "Write a reply..."}
                />
                <button
                  onClick={() => handleReply(doubt)}
                  disabled={replyLoadingId === doubt._id}
                  className="mt-2 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {replyLoadingId === doubt._id ? "Sending..." : doubt.reply ? "Update Reply" : "Send Reply"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Doubts;
