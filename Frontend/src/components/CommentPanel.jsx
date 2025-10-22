// Frontend/src/components/CommentPanel.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { IoClose, IoSend } from 'react-icons/io5';
import { FaUserCircle } from 'react-icons/fa'; // Placeholder icon

// Simple time ago function (consider using a library like date-fns for more complex needs)
function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    return Math.floor(seconds) + "s";
}


function CommentPanel({ foodId, onClose }) {
    const [comments, setComments] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [totalComments, setTotalComments] = useState(0);

    const listRef = useRef(null); // Ref for the scrollable comments list
    const observer = useRef(); // Ref for IntersectionObserver

    const isValidComment = newComment.trim().length > 0;

    // --- Fetching Logic ---
    const fetchComments = useCallback(async (pageToFetch) => {
        if (isLoading) return; // Prevent concurrent fetches
        setIsLoading(true);
        setError(null);
        console.log(`Fetching comments for food ${foodId}, page ${pageToFetch}`);

        try {
            const response = await axios.get(
                `http://localhost:8000/api/food/${foodId}/comments?page=${pageToFetch}&limit=15`,
                { withCredentials: true }
            );
            const data = response.data;
            setComments(prev => pageToFetch === 1 ? data.comments : [...prev, ...data.comments]);
            setHasMore(data.hasMore);
            setTotalComments(data.totalComments || 0);
            setCurrentPage(pageToFetch); // Update current page *after* successful fetch

        } catch (err) {
            console.error("Failed to fetch comments:", err);
            setError(err.response?.data?.message || "Could not load comments.");
        } finally {
            setIsLoading(false);
        }
    }, [foodId, isLoading]); // Dependency: foodId, isLoading

    // --- Initial Fetch ---
    useEffect(() => {
        if (foodId) {
             setComments([]); // Clear old comments when foodId changes
             setCurrentPage(1); // Reset page
             setHasMore(true); // Assume more initially
             fetchComments(1); // Fetch first page
        }
    }, [foodId]); // Trigger only when foodId changes // Removed fetchComments from here


     // --- Infinite Scroll Logic ---
     const lastCommentElementRef = useCallback(node => {
        if (isLoading) return; // Don't observe while loading
        if (observer.current) observer.current.disconnect(); // Disconnect previous observer

        observer.current = new IntersectionObserver(entries => {
            // If the last element is visible and there are more comments to load
            if (entries[0].isIntersecting && hasMore) {
                console.log('Last comment visible, fetching next page...');
                fetchComments(currentPage + 1);
            }
        });

        if (node) observer.current.observe(node); // Observe the new last element
    }, [isLoading, hasMore, fetchComments, currentPage]);


    // --- Comment Submission Logic ---
    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!isValidComment || isSubmitting) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await axios.post(
                `http://localhost:8000/api/food/${foodId}/comment`,
                { comment: newComment.trim() },
                { withCredentials: true }
            );

            // Optimistic update: Add the new comment immediately
            // Use the data returned from the backend which includes populated user info
            setComments(prev => [response.data.data, ...prev]);
            setTotalComments(prev => prev + 1); // Increment total count
            setNewComment(''); // Clear input field

        } catch (err) {
            console.error("Failed to post comment:", err);
            setError(err.response?.data?.message || "Could not post comment.");
        } finally {
            setIsSubmitting(false);
        }
    };


    // --- UI State (Simplified: No expand/collapse for now) ---
    // For simplicity, let's start with a fixed height panel
    const panelHeightClass = "h-[60vh]"; // Fixed height, adjust as needed

    return (
        // Overlay to close panel when clicking outside
        <div
            className="fixed inset-0 bg-black/50 z-40 flex items-end justify-center"
            onClick={onClose} // Close when clicking the overlay
        >
            {/* Comment Panel */}
            <div
                className={`w-full max-w-lg bg-white rounded-t-2xl shadow-xl flex flex-col ${panelHeightClass} transition-all duration-300 ease-in-out transform translate-y-0`}
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside panel
            >
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
                    {/* Drag Handle Placeholder (non-functional for now) */}
                    <div className="w-10 h-1.5 bg-gray-300 rounded-full mx-auto absolute top-1 left-1/2 -translate-x-1/2 cursor-grab"></div>
                    <h2 className="text-center font-semibold text-gray-700 flex-grow pt-2">{totalComments} Comments</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 absolute top-2 right-3">
                        <IoClose size={24} />
                    </button>
                </div>

                {/* Comments List (Scrollable) */}
                <div ref={listRef} className="flex-grow overflow-y-auto p-4 space-y-4">
                    {comments.map((comment, index) => {
                         // Attach ref to the last element for infinite scroll detection
                         const isLastElement = comments.length === index + 1;
                         return (
                            <div key={comment._id} ref={isLastElement ? lastCommentElementRef : null} className="flex items-start gap-3">
                                {/* User Avatar Placeholder */}
                                <FaUserCircle size={32} className="text-gray-400 mt-1 flex-shrink-0" />
                                {/* Comment Content */}
                                <div className="flex-grow">
                                    <p className="text-xs font-semibold text-gray-800 mb-0.5">
                                        {comment.user?.userName || 'User'} {/* Use populated user data */}
                                        <span className="text-gray-400 font-normal ml-2">{timeAgo(comment.createdAt)}</span>
                                    </p>
                                    <p className="text-sm text-gray-700 break-words">{comment.comment}</p>
                                </div>
                            </div>
                         );
                    })}
                    {/* Loading Indicator */}
                    {isLoading && <p className="text-center text-gray-500 py-2">Loading more comments...</p>}
                    {/* End of Comments Indicator */}
                    {!isLoading && !hasMore && comments.length > 0 && <p className="text-center text-gray-400 text-xs py-2">-- End of comments --</p>}
                     {/* No Comments Yet */}
                     {!isLoading && comments.length === 0 && !error && <p className="text-center text-gray-400 py-6">Be the first to comment!</p>}
                     {/* Error Loading Comments */}
                     {error && !isLoading && <p className="text-center text-red-500 py-4">{error}</p>}
                </div>


                {/* Comment Input Area */}
                <form onSubmit={handleAddComment} className="p-3 border-t border-gray-200 bg-gray-50 sticky bottom-0">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-grow border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange"
                            disabled={isSubmitting}
                        />
                        <button
                            type="submit"
                            disabled={!isValidComment || isSubmitting}
                            className={`p-2 rounded-full transition-colors duration-200 ${
                                isValidComment ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                            aria-label="Post comment"
                        >
                            {isSubmitting ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                 </svg>
                            ) : (
                                <IoSend size={20} />
                            )}
                        </button>
                    </div>
                     {error && isSubmitting && <p className="text-xs text-red-500 mt-1 pl-2">{error}</p>} {/* Show submission error */}
                </form>
            </div>
        </div>
    );
}

export default CommentPanel;