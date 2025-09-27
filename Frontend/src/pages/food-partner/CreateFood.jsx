import React, { useState } from 'react';

function CreateFood() {
  const [formData, setFormData] = useState({
    name: '',
    video: '',
    description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // For MVP, just log the data. In a real app, you would POST to the backend.
    console.log('Submitting food item:', formData);
    // Reset form
    setFormData({ name: '', video: '', description: '' });
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Create Food Reel</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter food name"
          />
        </div>

        <div>
          <label htmlFor="video" className="block text-sm font-medium mb-1">
            Video URL<span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            id="video"
            name="video"
            required
            value={formData.video}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/video.mp4"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional description"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Create Reel
        </button>
      </form>
    </div>
  );
}

export default CreateFood;
