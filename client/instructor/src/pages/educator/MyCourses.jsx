import React, { useEffect, useMemo, useState } from "react";
import Loading from "../../components/student/Loading";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteEducatorCourse,
  fetchEducatorCourses,
  updateEducatorCourse,
} from "../../redux/slice/educatorSlice";
import { appConfig } from "../../redux/service/api";

const getDiscountedPrice = (course) => course.coursePrice - (course.discount * course.coursePrice) / 100;
const makeId = () =>
  globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const getEditableContent = (course) =>
  (course.courseContent || []).map((chapter, chapterIndex) => ({
    chapterId: chapter.chapterId || makeId(),
    chapterOrder: chapter.chapterOrder || chapterIndex + 1,
    chapterTitle: chapter.chapterTitle || "",
    chapterContent: (chapter.chapterContent || []).map((lecture, lectureIndex) => ({
      lectureId: lecture.lectureId || makeId(),
      lectureTitle: lecture.lectureTitle || "",
      lectureDuration: lecture.lectureDuration || "",
      lectureUrl: lecture.lectureUrl || "",
      isPreviewFree: Boolean(lecture.isPreviewFree),
      lectureOrder: lecture.lectureOrder || lectureIndex + 1,
      lectureVideo: null,
    })),
  }));

const MyCourses = () => {
  const dispatch = useDispatch();
  const currency = appConfig.currency || "₹";
  const courses = useSelector((state) => state.educator.courses);
  const { coursesLoaded, loading } = useSelector((state) => state.educator);
  const user = useSelector((state) => state.auth.user);
  const isEducator = user?.role === "instructor" && user?.status === "approved";
  const [viewCourse, setViewCourse] = useState(null);
  const [editCourse, setEditCourse] = useState(null);
  const [editImage, setEditImage] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const editForm = useMemo(() => {
    if (!editCourse) return null;

    return {
      courseTitle: editCourse.courseTitle || "",
      courseDescription: editCourse.courseDescription || "",
      coursePrice: editCourse.coursePrice || 0,
      discount: editCourse.discount || 0,
      isPublished: editCourse.isPublished !== false,
      courseContent: getEditableContent(editCourse),
    };
  }, [editCourse]);

  const [formData, setFormData] = useState(editForm);

  useEffect(() => {
    setFormData(editForm);
    setEditImage(null);
  }, [editForm]);

  useEffect(() => {
    if (!isEducator) return;
    dispatch(fetchEducatorCourses()).then((result) => {
      if (fetchEducatorCourses.rejected.match(result)) {
        toast.error(result.payload || "Failed to load courses");
      }
    });
  }, [dispatch, isEducator]);

  const handleEditChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleChapterChange = (chapterIndex, value) => {
    setFormData((current) => ({
      ...current,
      courseContent: current.courseContent.map((chapter, index) =>
        index === chapterIndex ? { ...chapter, chapterTitle: value } : chapter
      ),
    }));
  };

  const addChapter = () => {
    setFormData((current) => ({
      ...current,
      courseContent: [
        ...current.courseContent,
        {
          chapterId: makeId(),
          chapterOrder: current.courseContent.length + 1,
          chapterTitle: "New Chapter",
          chapterContent: [],
        },
      ],
    }));
  };

  const removeChapter = (chapterIndex) => {
    setFormData((current) => ({
      ...current,
      courseContent: current.courseContent
        .filter((_, index) => index !== chapterIndex)
        .map((chapter, index) => ({ ...chapter, chapterOrder: index + 1 })),
    }));
  };

  const addLecture = (chapterIndex) => {
    setFormData((current) => ({
      ...current,
      courseContent: current.courseContent.map((chapter, index) => {
        if (index !== chapterIndex) return chapter;

        return {
          ...chapter,
          chapterContent: [
            ...chapter.chapterContent,
            {
              lectureId: makeId(),
              lectureTitle: "New Lecture",
              lectureDuration: "",
              lectureUrl: "",
              isPreviewFree: false,
              lectureOrder: chapter.chapterContent.length + 1,
              lectureVideo: null,
            },
          ],
        };
      }),
    }));
  };

  const updateLecture = (chapterIndex, lectureIndex, field, value) => {
    setFormData((current) => ({
      ...current,
      courseContent: current.courseContent.map((chapter, currentChapterIndex) => {
        if (currentChapterIndex !== chapterIndex) return chapter;

        return {
          ...chapter,
          chapterContent: chapter.chapterContent.map((lecture, currentLectureIndex) =>
            currentLectureIndex === lectureIndex ? { ...lecture, [field]: value } : lecture
          ),
        };
      }),
    }));
  };

  const removeLecture = (chapterIndex, lectureIndex) => {
    setFormData((current) => ({
      ...current,
      courseContent: current.courseContent.map((chapter, currentChapterIndex) => {
        if (currentChapterIndex !== chapterIndex) return chapter;

        return {
          ...chapter,
          chapterContent: chapter.chapterContent
            .filter((_, currentLectureIndex) => currentLectureIndex !== lectureIndex)
            .map((lecture, index) => ({ ...lecture, lectureOrder: index + 1 })),
        };
      }),
    }));
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!editCourse || !formData) return;

    const courseData = {
      courseTitle: formData.courseTitle.trim(),
      courseDescription: formData.courseDescription.trim(),
      coursePrice: Number(formData.coursePrice),
      discount: Number(formData.discount),
      isPublished: Boolean(formData.isPublished),
      courseContent: formData.courseContent.map((chapter, chapterIndex) => ({
        chapterId: chapter.chapterId,
        chapterOrder: chapterIndex + 1,
        chapterTitle: chapter.chapterTitle.trim(),
        chapterContent: chapter.chapterContent.map((lecture, lectureIndex) => ({
          lectureId: lecture.lectureId,
          lectureTitle: lecture.lectureTitle.trim(),
          lectureDuration: Number(lecture.lectureDuration),
          lectureUrl: lecture.lectureUrl,
          isPreviewFree: Boolean(lecture.isPreviewFree),
          lectureOrder: lectureIndex + 1,
        })),
      })),
    };

    if (!courseData.courseTitle || !courseData.courseDescription) {
      toast.error("Title and description are required");
      return;
    }

    const invalidChapter = formData.courseContent.find((chapter) => !chapter.chapterTitle.trim());
    if (invalidChapter) {
      toast.error("Chapter title is required");
      return;
    }

    const invalidLecture = formData.courseContent
      .flatMap((chapter) => chapter.chapterContent)
      .find((lecture) => !lecture.lectureTitle.trim() || !lecture.lectureDuration || (!lecture.lectureUrl && !lecture.lectureVideo));

    if (invalidLecture) {
      toast.error("Every lecture needs title, duration, and video");
      return;
    }

    const payload = new FormData();
    payload.append("courseData", JSON.stringify(courseData));
    if (editImage) {
      payload.append("image", editImage);
    }
    formData.courseContent.forEach((chapter) => {
      chapter.chapterContent.forEach((lecture) => {
        if (lecture.lectureVideo) {
          payload.append(`lecture_video_${lecture.lectureId}`, lecture.lectureVideo);
        }
      });
    });

    setEditLoading(true);
    const result = await dispatch(updateEducatorCourse({ id: editCourse._id, formData: payload }));

    if (updateEducatorCourse.fulfilled.match(result)) {
      toast.success(result.payload.message);
      setEditCourse(null);
    } else {
      toast.error(result.payload || "Failed to update course");
    }

    setEditLoading(false);
  };

  const handleDelete = async (course) => {
    const confirmed = window.confirm(`Delete "${course.courseTitle}"? This action cannot be undone.`);
    if (!confirmed) return;

    const result = await dispatch(deleteEducatorCourse(course._id));
    if (deleteEducatorCourse.fulfilled.match(result)) {
      toast.success(result.payload.message);
    } else {
      toast.error(result.payload || "Failed to delete course");
    }
  };

  if (!coursesLoaded || loading) {
    return <Loading />;
  }

  return (
    <div className="h-full mb-10 flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0">
      <div className="w-full">
        <h2 className="pb-4 text-lg font-medium">My Courses</h2>
        {courses.length === 0 ? (
          <div className="max-w-4xl w-full rounded-md bg-white border border-gray-500/20 p-8 text-center">
            <p className="text-lg font-medium text-gray-700">No courses added yet</p>
            <p className="mt-2 text-sm text-gray-500">Create your first course from the Add Course page.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center max-w-6xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
            <div className="w-full overflow-x-auto">
              <table className="md:table-auto table-fixed w-full overflow-hidden">
                <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
                  <tr>
                    <th className="px-4 py-3 font-semibold truncate">All Courses</th>
                    <th className="px-4 py-3 font-semibold truncate">Courses Price</th>
                    <th className="px-4 py-3 font-semibold truncate">Earnings</th>
                    <th className="px-4 py-3 font-semibold truncate">Students</th>
                    <th className="px-4 py-3 font-semibold truncate">Status</th>
                    <th className="px-4 py-3 font-semibold truncate">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-500">
                  {courses.map((course) => {
                    const price = getDiscountedPrice(course);

                    return (
                      <tr key={course._id} className="border-b border-gray-500/20">
                        <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                          <img src={course.courseThumbnail} alt="Course" className="w-16 h-10 object-cover rounded" />
                          <span className="truncate hidden md:block">{course.courseTitle}</span>
                        </td>
                        <td className="px-4 py-3">{price === 0 ? "Free" : `${currency} ${price.toFixed(2)}`}</td>
                        <td className="px-4 py-3">
                          {currency} {Math.floor(course.enrolledStudents.length * price).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">{course.enrolledStudents.length}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${course.isPublished === false ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                            {course.isPublished === false ? "Draft" : "Published"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => setViewCourse(course)} className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700">
                              View
                            </button>
                            <button onClick={() => setEditCourse(course)} className="px-3 py-1.5 rounded bg-slate-800 text-white hover:bg-slate-900">
                              Edit
                            </button>
                            <button onClick={() => handleDelete(course)} className="px-3 py-1.5 rounded bg-rose-600 text-white hover:bg-rose-700">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {viewCourse && (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center">
          <div className="bg-white rounded-md w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-800">Course Details</h3>
              <button onClick={() => setViewCourse(null)} className="text-gray-500 hover:text-gray-800">Close</button>
            </div>
            <div className="p-5 space-y-5">
              <div className="flex flex-col sm:flex-row gap-4">
                <img src={viewCourse.courseThumbnail} alt={viewCourse.courseTitle} className="w-full sm:w-48 h-28 object-cover rounded" />
                <div>
                  <h4 className="text-xl font-semibold text-gray-800">{viewCourse.courseTitle}</h4>
                  <p className="mt-2 text-sm text-gray-500">
                    {viewCourse.enrolledStudents.length} students enrolled - {viewCourse.discount}% discount
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Price: {getDiscountedPrice(viewCourse) === 0 ? "Free" : `${currency} ${getDiscountedPrice(viewCourse).toFixed(2)}`}
                  </p>
                </div>
              </div>
              <div>
                <h5 className="font-semibold text-gray-800">Description</h5>
                <div className="mt-2 text-sm text-gray-600 prose max-w-none" dangerouslySetInnerHTML={{ __html: viewCourse.courseDescription }} />
              </div>
              <div>
                <h5 className="font-semibold text-gray-800">Chapters & Lectures</h5>
                <div className="mt-3 space-y-3">
                  {viewCourse.courseContent?.length ? (
                    viewCourse.courseContent.map((chapter) => (
                      <div key={chapter.chapterId} className="border border-gray-200 rounded-md p-3">
                        <p className="font-medium text-gray-800">
                          {chapter.chapterOrder}. {chapter.chapterTitle}
                        </p>
                        <div className="mt-2 space-y-2">
                          {chapter.chapterContent.map((lecture) => (
                            <div key={lecture.lectureId} className="flex items-center justify-between text-sm text-gray-500">
                              <span>{lecture.lectureOrder}. {lecture.lectureTitle}</span>
                              <span>{lecture.lectureDuration} min - {lecture.isPreviewFree ? "Free" : "Paid"}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No chapters added.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {editCourse && formData && (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center">
          <form onSubmit={handleEditSubmit} className="bg-white rounded-md w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-800">Edit Course</h3>
              <button type="button" onClick={() => setEditCourse(null)} className="text-gray-500 hover:text-gray-800">Close</button>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Course Title</label>
                <input name="courseTitle" value={formData.courseTitle} onChange={handleEditChange} className="mt-1 w-full border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Course Description</label>
                <textarea name="courseDescription" value={formData.courseDescription} onChange={handleEditChange} rows={6} className="mt-1 w-full border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-sm font-medium">Course Price</label>
                <input type="number" name="coursePrice" value={formData.coursePrice} onChange={handleEditChange} min="0" className="mt-1 w-full border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-sm font-medium">Discount %</label>
                <input type="number" name="discount" value={formData.discount} onChange={handleEditChange} min="0" max="100" className="mt-1 w-full border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Thumbnail</label>
                <div className="mt-2 flex items-center gap-4">
                  <img src={editImage ? URL.createObjectURL(editImage) : editCourse.courseThumbnail} alt="Thumbnail" className="w-24 h-14 object-cover rounded" />
                  <input type="file" accept="image/*" onChange={(event) => setEditImage(event.target.files?.[0] || null)} />
                </div>
              </div>
              <label className="md:col-span-2 flex items-center gap-2 text-sm">
                <input type="checkbox" name="isPublished" checked={formData.isPublished} onChange={handleEditChange} />
                Published
              </label>
              <div className="md:col-span-2 border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-semibold text-gray-800">Chapters & Lectures</h4>
                  <button type="button" onClick={addChapter} className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm hover:bg-blue-700">
                    Add Chapter
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  {formData.courseContent.length === 0 ? (
                    <p className="text-sm text-gray-500 border border-dashed border-gray-300 rounded p-4 text-center">
                      No chapters added yet.
                    </p>
                  ) : (
                    formData.courseContent.map((chapter, chapterIndex) => (
                      <div key={chapter.chapterId} className="border border-gray-200 rounded-md p-3">
                        <div className="flex flex-col md:flex-row gap-3 md:items-center">
                          <div className="flex-1">
                            <label className="text-xs font-medium text-gray-500">Chapter {chapterIndex + 1}</label>
                            <input
                              value={chapter.chapterTitle}
                              onChange={(event) => handleChapterChange(chapterIndex, event.target.value)}
                              className="mt-1 w-full border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Chapter title"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => addLecture(chapterIndex)} className="px-3 py-2 rounded bg-slate-800 text-white text-sm hover:bg-slate-900">
                              Add Lecture
                            </button>
                            <button type="button" onClick={() => removeChapter(chapterIndex)} className="px-3 py-2 rounded bg-rose-600 text-white text-sm hover:bg-rose-700">
                              Remove
                            </button>
                          </div>
                        </div>

                        <div className="mt-3 space-y-3">
                          {chapter.chapterContent.length === 0 ? (
                            <p className="text-sm text-gray-500 bg-gray-50 rounded p-3">No lectures in this chapter.</p>
                          ) : (
                            chapter.chapterContent.map((lecture, lectureIndex) => (
                              <div key={lecture.lectureId} className="bg-gray-50 rounded-md p-3 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                                <div className="md:col-span-4">
                                  <label className="text-xs font-medium text-gray-500">Lecture Title</label>
                                  <input
                                    value={lecture.lectureTitle}
                                    onChange={(event) => updateLecture(chapterIndex, lectureIndex, "lectureTitle", event.target.value)}
                                    className="mt-1 w-full border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Lecture title"
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <label className="text-xs font-medium text-gray-500">Duration</label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={lecture.lectureDuration}
                                    onChange={(event) => updateLecture(chapterIndex, lectureIndex, "lectureDuration", event.target.value)}
                                    className="mt-1 w-full border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Min"
                                  />
                                </div>
                                <label className="md:col-span-2 flex items-center gap-2 text-sm pb-2">
                                  <input
                                    type="checkbox"
                                    checked={lecture.isPreviewFree}
                                    onChange={(event) => updateLecture(chapterIndex, lectureIndex, "isPreviewFree", event.target.checked)}
                                  />
                                  Free
                                </label>
                                <div className="md:col-span-3">
                                  <label className="text-xs font-medium text-gray-500">
                                    {lecture.lectureUrl ? "Replace Video" : "Upload Video"}
                                  </label>
                                  <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(event) =>
                                      updateLecture(chapterIndex, lectureIndex, "lectureVideo", event.target.files?.[0] || null)
                                    }
                                    className="mt-1 w-full text-sm"
                                  />
                                  <p className="mt-1 text-xs text-gray-500">
                                    {lecture.lectureVideo?.name || (lecture.lectureUrl ? "Existing video saved" : "Video required")}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeLecture(chapterIndex, lectureIndex)}
                                  className="md:col-span-1 px-3 py-2 rounded bg-rose-600 text-white text-sm hover:bg-rose-700"
                                >
                                  Del
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="md:col-span-2 flex justify-end gap-3">
                <button type="button" onClick={() => setEditCourse(null)} className="px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={editLoading} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MyCourses;
