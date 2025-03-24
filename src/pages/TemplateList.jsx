import React, { useState, useEffect } from "react";
import {
  useGetTemplatesQuery,
  useGetAccountDetailsQuery,
} from "../store/adminApiSlice";
import PhoneNumbers from "./PhoneNumbers";
import { Link } from "react-router-dom";
import CreateMessageTemplateForm from "../components/CreateTemplate";
import { FaUserCircle } from "react-icons/fa";
import { Tilt } from "@jdion/tilt-react";
import Button from "../items/ButtonComponent";

const TemplatesList = () => {
  const { data: templates, isLoading, isError } = useGetTemplatesQuery();
  // console.log("templates: ", templates);
  const { data: accountDetails } = useGetAccountDetailsQuery();
  const [imageDataMap, setImageDataMap] = useState({});
  const [imageLoading, setImageLoading] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [showCreateTemplateForm, setShowCreateTemplateForm] = useState(false);

  const loadImageData = async (imageUrl) => {
    if (!imageUrl || imageDataMap[imageUrl] || imageLoading[imageUrl]) {
      return; // Skip if already loaded or in progress
    }

    setImageLoading((prev) => ({ ...prev, [imageUrl]: true }));

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(
          `HTTP error! Status: ${response.status} for URL: ${imageUrl}`
        );
      }

      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = () => {
        setImageDataMap((prev) => ({ ...prev, [imageUrl]: reader.result }));
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Error loading image:", error);
      setImageDataMap((prev) => ({ ...prev, [imageUrl]: null }));
    } finally {
      setImageLoading((prev) => ({ ...prev, [imageUrl]: false }));
    }
  };

  useEffect(() => {
    if (templates) {
      templates.forEach((template) => {
        template?.components
          ?.filter((comp) => comp.type === "HEADER" && comp.format === "IMAGE")
          .forEach((comp) => {
            comp?.example?.header_handle?.forEach((imageUrl) => {
              if (imageUrl && !imageDataMap[imageUrl]) {
                loadImageData(imageUrl);
              }
            });
          });
      });
    }
  }, [templates]); // Removed imageDataMap from dependency array

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
    <div className="flex flex-col h-screen w-screen bg-gradient-to-br from-gray-500 to-gray-100">
      <header className="bg-gradient-to-br from-blue-50 to-blue-100 shadow-md p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-blue-800">
            Template Management
          </h1>
          <PhoneNumbers />
          <div className="flex items-center space-x-4 bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-200 p-3">
            <FaUserCircle className="text-gray-400 text-2xl" />
            <div className="flex flex-col items-start">
              <span className="text-xs font-medium text-gray-500 uppercase">
                ID
              </span>
              <span className="text-lg font-semibold text-blue-600">
                {accountDetails?.id}
              </span>
            </div>
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

      <main className="flex-grow overflow-y-auto p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-700">Templates List</h2>
            <button
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md hover:from-green-600 hover:to-green-700 transition-all duration-300 ease-in-out transform hover:scale-105"
              onClick={() => setShowCreateTemplateForm(true)}
            >
              Create New Template
            </button>
          </div>

          <div className="flex flex-col space-y-4 mb-6">
            <Link to="/sendmessage">
              <button className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl focus:ring-4 focus:ring-blue-300">
                ✉️ Send Message
              </button>
            </Link>

            <div className="flex space-x-3 overflow-x-auto scrollbar-hide p-3 bg-gray-100 rounded-lg shadow-inner">
              <Button
                onClick={() => setSelectedCategory("all")}
                isSelected={selectedCategory === "all"}
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  isSelected={selectedCategory === category}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 p-6">
            {filteredTemplates.map((template) => (
              <Tilt key={template.name}>
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 transition-transform duration-300 hover:shadow-xl hover:-translate-y-2">
                  {/* Card Body */}
                  <div className="p-5">
                    {/* Template Title & Language */}
                    <h3 className="text-xl font-semibold text-blue-700 mb-3 text-center">
                      {template.name} - {template.language}
                    </h3>
                    <h3
                      className={`text-xl font-semibold mb-3 text-center ${
                        template.status === "APPROVED"
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {template.status}
                    </h3>

                    {/* Image Section */}
                    <div className="relative h-44 w-full bg-gray-100 rounded-md overflow-hidden flex items-center justify-center mb-4">
                      {(() => {
                        const headerComponents = template?.components?.filter(
                          (comp) =>
                            comp.type === "HEADER" && comp.format === "IMAGE"
                        );

                        if (
                          headerComponents.length === 0 ||
                          !headerComponents.some(
                            (comp) => comp.example?.header_handle?.length > 0
                          )
                        ) {
                          return (
                            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                              No Image Available
                            </div>
                          );
                        }

                        return headerComponents.map((comp, index) =>
                          comp.example?.header_handle?.map((imageUrl, i) => (
                            <div
                              key={`${index}-${i}`}
                              className="absolute inset-0"
                            >
                              {imageLoading[imageUrl] ? (
                                <div className="animate-pulse bg-gray-300 h-full w-full rounded-md"></div>
                              ) : imageDataMap[imageUrl] ? (
                                <img
                                  src={imageDataMap[imageUrl]}
                                  alt="Template Header"
                                  className="w-full h-full object-cover rounded-md"
                                />
                              ) : (
                                !imageLoading[imageUrl] && (
                                  <div className="flex items-center justify-center h-full text-red-500 text-sm">
                                    No Preview Available
                                  </div>
                                )
                              )}
                            </div>
                          ))
                        );
                      })()}
                    </div>

                    {/* Components Section */}

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                      {template.components?.map(
                        (component, index) =>
                          component.text && (
                            <p
                              key={index}
                              className="text-sm text-gray-600 mb-1 last:mb-0"
                            >
                              {component.text}
                            </p>
                          )
                      )}
                    </div>
                  </div>
                </div>
              </Tilt>
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-white p-4 text-center text-gray-600 border-t border-gray-100">
        <p>© {new Date().getFullYear()} Template Management System</p>
      </footer>

      {showCreateTemplateForm && (
        <div className="fixed inset-0 bg-red-900 bg-opacity-90 overflow-y-scroll h-screen w-full flex items-start justify-start">
          <div className="relative bg-yellow-200 border-8 border-double border-fuchsia-500 rounded-none shadow-none p-2 w-full max-w-full m-0">
            <h3 className="text-xs font-thin text-red-500 underline line-through mb-1">
              Create New Template
            </h3>
            <div className="mb-1">
              <CreateMessageTemplateForm />
            </div>
            <div className="flex justify-start space-x-1">
              <button
                className="px-1 py-0.5 bg-lime-500 text-white rounded-sm hover:bg-lime-700 transition-none duration-0"
                onClick={() => setShowCreateTemplateForm(false)}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesList;
