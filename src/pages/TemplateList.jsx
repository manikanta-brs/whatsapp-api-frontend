import React, { useState, useEffect } from "react";
import {
  useGetTemplatesQuery,
  useGetAccountDetailsQuery,
} from "../store/adminApiSlice";
import PhoneNumbers from "./PhoneNumbers";
import { Link } from "react-router-dom";
import CreateMessageTemplateForm from "../components/CreateTemplate";

const TemplatesList = () => {
  const { data: templates, isLoading, isError } = useGetTemplatesQuery();
  console.log({ templates });
  const { data: accountDetails } = useGetAccountDetailsQuery();
  const [imageDataMap, setImageDataMap] = useState({});
  const [imageLoading, setImageLoading] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [showCreateTemplateForm, setShowCreateTemplateForm] = useState(false); // State for modal visibility

  useEffect(() => {
    async function loadImageData(imageUrl) {
      setImageLoading((prev) => ({ ...prev, [imageUrl]: true }));
      try {
        const response = await fetch(imageUrl);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const blob = await response.blob();
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        setImageDataMap((prev) => ({ ...prev, [imageUrl]: dataUrl }));
      } catch (e) {
        console.error("Image load error", e);
        setImageDataMap((prev) => ({ ...prev, [imageUrl]: null }));
      } finally {
        setImageLoading((prev) => ({ ...prev, [imageUrl]: false }));
      }
    }

    templates?.forEach((template) => {
      template?.components
        ?.filter((comp) => comp.type === "HEADER" && comp.format === "IMAGE")
        .forEach((comp) => {
          comp?.example?.header_handle?.forEach((imageUrl) => {
            if (!imageDataMap[imageUrl]) {
              loadImageData(imageUrl);
            }
          });
        });
    });
  }, [templates]);

  useEffect(() => {
    if (templates) {
      if (selectedCategory === "all") {
        setFilteredTemplates(templates);
      } else {
        setFilteredTemplates(
          templates.filter((template) => template.category === selectedCategory)
        );
      }
    }
  }, [templates, selectedCategory]);

  const categories = Array.from(
    new Set(templates?.map((template) => template.category))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <p className="text-gray-500">Loading templates...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <p className="text-red-500">Error fetching templates.</p>
      </div>
    );
  }

  if (!templates || templates.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <p className="text-gray-600">No templates available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">
            Template Management
          </h1>
          <PhoneNumbers />
          {/* Account Details Display */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
            {/* ID Section */}
            <div className="flex flex-col items-start mr-4">
              <span className="text-xs font-medium text-gray-500 uppercase">
                ID
              </span>
              <span className="text-lg font-semibold text-blue-600">
                {accountDetails?.id}
              </span>
            </div>

            {/* Name Section */}
            <div className="flex flex-col items-end">
              <span className="text-xs font-medium text-gray-500 uppercase">
                Name
              </span>
              <span className="text-lg font-semibold text-gray-800">
                {accountDetails?.name}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-700">
              Templates List
            </h2>
            {/* Button to open Create Template Form */}
            <button
              className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition duration-300 ease-in-out"
              onClick={() => setShowCreateTemplateForm(true)}
            >
              Create New Template
            </button>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex flex-col items-start space-y-4">
            {/* Send Message Button (moved to top) */}
            <Link to="/sendmessage">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out">
                Send Message
              </button>
            </Link>

            {/* Category Filter Buttons (horizontal scroll) */}
            <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedCategory === "all"
                    ? "bg-green-600 text-white shadow-sm mb-3"
                    : "bg-gray-100 text-white transition duration-200 mb-3"
                }`}
                onClick={() => setSelectedCategory("all")}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    selectedCategory === category
                      ? "bg-green-600 text-white shadow-sm mb-3"
                      : "bg-gray-100 text-white transition duration-200 mb-3"
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.name}
                className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow duration-300"
              >
                <h3 className="text-lg font-semibold text-blue-600 mb-2">
                  {template.name}
                </h3>
                <div className="container h-auto">
                  {template?.components
                    ?.filter(
                      (comp) =>
                        comp.type === "HEADER" && comp.format === "IMAGE"
                    )
                    ?.map((comp, index) =>
                      comp?.example?.header_handle?.map((imageUrl, i) => (
                        <div key={`${index}-${i}`}>
                          {imageLoading[imageUrl] && (
                            <div>Loading image...</div>
                          )}
                          {imageDataMap[imageUrl] && (
                            <img
                              src={imageDataMap[imageUrl]}
                              alt="Template Header"
                              style={{ maxWidth: "100%", height: "auto" }}
                            />
                          )}
                          {!imageDataMap[imageUrl] &&
                            !imageLoading[imageUrl] && (
                              <div>Error loading image.</div>
                            )}
                        </div>
                      ))
                    )}
                </div>
                <div>
                  <p className="text-sm text-gray-700">
                    Category: {template.category}
                  </p>
                  <p className="text-sm text-gray-700">
                    Status: {template.status}
                  </p>
                </div>
                <h4 className="text-md font-semibold mt-2 text-gray-800">
                  Components:
                </h4>
                <div className="mt-2">
                  {template.components &&
                    template.components.map((component, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-2 rounded-md border border-gray-300 mb-2"
                      >
                        <p className="text-sm text-gray-800">
                          Type: {component.type}
                        </p>
                        <p className="text-sm text-gray-800">
                          Text: {component.text}
                        </p>
                        {component.format && (
                          <p className="text-sm text-gray-800">
                            Format: {component.format}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-200 p-4 text-center text-gray-600">
        <p>© {new Date().getFullYear()} Template Management System</p>
      </footer>

      {/* Modal for Create Template Form */}
      {showCreateTemplateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Create New Template
            </h3>
            <div className="mt-2">
              <CreateMessageTemplateForm />
            </div>
            <div className="mt-4 flex justify-end">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                onClick={() => setShowCreateTemplateForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesList;
