// import React, { useState } from "react";
// import { useCreateTemplateMutation } from "../store/adminApiSlice";

// const CreateMessageTemplateForm = () => {
//   const [templateName, setTemplateName] = useState("");
//   const [category, setCategory] = useState("marketing");
//   const [allowCategoryChange, setAllowCategoryChange] = useState(false);
//   const [language, setLanguage] = useState("en_US");
//   const [components, setComponents] = useState([{ type: "body", text: "" }]);

//   const [createTemplate, { isLoading, isError, error }] =
//     useCreateTemplateMutation();

//   const addComponent = () => {
//     setComponents([...components, { type: "body", text: "" }]);
//   };

//   const removeComponent = (index) => {
//     const newComponents = [...components];
//     newComponents.splice(index, 1);
//     setComponents(newComponents);
//   };

//   const updateComponent = (index, field, value) => {
//     const newComponents = [...components];
//     newComponents[index][field] = value;
//     setComponents(newComponents);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const templateData = {
//       name: templateName,
//       category: category,
//       allow_category_change: allowCategoryChange,
//       language: language,
//       components: components,
//     };

//     try {
//       // Use the createTemplate mutation here
//       await createTemplate(templateData).unwrap(); // Use unwrap() for error handling
//       console.log("Template created successfully!");
//       alert("Template created successfully!");
//       // Reset the form after successful creation (optional)
//       setTemplateName("");
//       setCategory("marketing");
//       setAllowCategoryChange(false);
//       setLanguage("en_US");
//       setComponents([{ type: "body", text: "" }]);
//     } catch (err) {
//       console.error("Error creating template:", err);
//       alert(
//         `Error creating template: ${err.message || "Failed to create template"}`
//       );
//     }
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <h2 className="text-2xl font-semibold mb-4">Create Message Template</h2>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         {/* Template Details */}
//         <div>
//           <label className="block text-gray-700 text-sm font-bold mb-2">
//             Template Name:
//           </label>
//           <input
//             type="text"
//             placeholder="Template Name"
//             value={templateName}
//             onChange={(e) => setTemplateName(e.target.value)}
//             className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//           />
//         </div>

//         <div>
//           <label className="block text-gray-700 text-sm font-bold mb-2">
//             Category:
//           </label>
//           <select
//             value={category}
//             onChange={(e) => setCategory(e.target.value)}
//             className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//           >
//             <option value="marketing">Marketing</option>
//             <option value="utility">Utility</option>
//             <option value="authentication">Authentication</option>
//           </select>
//         </div>
//         <div>
//           <label className="block text-gray-700 text-sm font-bold mb-2">
//             Allow Category Change:
//           </label>
//           <input
//             type="checkbox"
//             checked={allowCategoryChange}
//             onChange={(e) => setAllowCategoryChange(e.target.checked)}
//           />
//         </div>

//         <div>
//           <label className="block text-gray-700 text-sm font-bold mb-2">
//             Language:
//           </label>
//           <input
//             type="text"
//             placeholder="Language"
//             value={language}
//             onChange={(e) => setLanguage(e.target.value)}
//             className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//           />
//         </div>

//         {/* Component List */}
//         <div>
//           <label className="block text-gray-700 text-sm font-bold mb-2">
//             Components:
//           </label>
//           {components.map((component, index) => (
//             <div key={index} className="mb-2 p-3 border rounded">
//               <label className="block text-gray-700 text-sm font-bold mb-2">
//                 Type:
//               </label>
//               <select
//                 value={component.type}
//                 onChange={(e) => updateComponent(index, "type", e.target.value)}
//                 className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//               >
//                 <option value="body">Body</option>
//                 <option value="header">Header</option>
//                 <option value="footer">Footer</option>
//               </select>

//               <label className="block text-gray-700 text-sm font-bold mb-2">
//                 Text:
//               </label>
//               <input
//                 type="text"
//                 placeholder="Component Text"
//                 value={component.text}
//                 onChange={(e) => updateComponent(index, "text", e.target.value)}
//                 className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//               />

//               <button
//                 type="button"
//                 onClick={() => removeComponent(index)}
//                 className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
//               >
//                 Remove
//               </button>
//             </div>
//           ))}
//         </div>

//         <button
//           type="button"
//           onClick={addComponent}
//           className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
//         >
//           Add Component
//         </button>

//         <button
//           type="submit"
//           className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
//           disabled={isLoading} // Disable the button while loading
//         >
//           {isLoading ? "Creating..." : "Create Template"}
//         </button>

//         {isError && (
//           <div className="text-red-500 mt-2">
//             Error: {error?.message || "Failed to create template"}
//           </div>
//         )}
//       </form>
//     </div>
//   );
// };

// export default CreateMessageTemplateForm;

import React, { useState } from "react";
import { useCreateTemplateMutation } from "../store/adminApiSlice";

const CreateMessageTemplateForm = () => {
  const [templateName, setTemplateName] = useState("");
  const [category, setCategory] = useState("marketing");
  const [allowCategoryChange, setAllowCategoryChange] = useState(false);
  const [language, setLanguage] = useState("en_US");
  const [header, setHeader] = useState({
    type: "header",
    format: "TEXT",
    text: "",
  });
  const [body, setBody] = useState({ type: "body", text: "" });
  const [footer, setFooter] = useState({ type: "footer", text: "" });

  const [createTemplate, { isLoading, isError, error }] =
    useCreateTemplateMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert template name to lowercase and validate
    const formattedTemplateName = templateName
      .toLowerCase()
      .replace(/[^a-zA-Z0-9_]/g, "_");
    if (!formattedTemplateName) {
      alert("Template name must be a valid variable name.");
      return;
    }

    const formattedComponents = [];

    if (header.format === "TEXT" && header.text) {
      formattedComponents.push({
        type: "header",
        format: header.format,
        text: header.text,
      });
    } else if (header.format !== "TEXT" && header.url) {
      formattedComponents.push({
        type: "header",
        format: header.format,
        [header.format.toLowerCase()]: { url: header.url },
      });
    }

    if (body.text) {
      formattedComponents.push({
        type: "body",
        text: body.text,
      });
    }

    if (footer.text) {
      formattedComponents.push({
        type: "footer",
        text: footer.text,
      });
    }

    const templateData = {
      name: formattedTemplateName,
      category,
      allow_category_change: allowCategoryChange,
      language,
      components: formattedComponents,
    };

    try {
      await createTemplate(templateData).unwrap();
      alert("Template created successfully!");
      setTemplateName("");
      setCategory("marketing");
      setAllowCategoryChange(false);
      setLanguage("en_US");
      setHeader({ type: "header", format: "TEXT", text: "" });
      setBody({ type: "body", text: "" });
      setFooter({ type: "footer", text: "" });
    } catch (err) {
      alert(
        `Error creating template: ${err.message || "Failed to create template"}`
      );
    }
  };

  const handleInsertVariable = (field, setField) => {
    const currentValue = field.text || "";
    const newValue = `${currentValue}{{${currentValue.split("{{").length}}}`;
    setField({ ...field, text: newValue });
  };

  return (
    <div className="bg-gray-100 min-h-screen py-12">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-blue-600 py-6 px-8 text-white">
          <h2 className="text-2xl font-semibold">Create Message Template</h2>
          <p className="mt-2 text-gray-200">
            Define your message template for WhatsApp.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label
              htmlFor="templateName"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Template Name:
            </label>
            <input
              type="text"
              id="templateName"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter template name"
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Category:
            </label>
            <div className="relative">
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="marketing">Marketing</option>
                <option value="utility">Utility</option>
                <option value="authentication">Authentication</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="allowCategoryChange"
              checked={allowCategoryChange}
              onChange={(e) => setAllowCategoryChange(e.target.checked)}
              className="mr-2 leading-tight"
            />
            <label
              htmlFor="allowCategoryChange"
              className="text-gray-700 text-sm font-bold"
            >
              Allow Category Change
            </label>
          </div>

          <div>
            <label
              htmlFor="language"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Language:
            </label>
            <input
              type="text"
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="e.g., en_US"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Header:
            </label>
            <div className="mb-4 p-4 border rounded-md bg-gray-50">
              <div className="mb-2">
                <label
                  htmlFor="header-format"
                  className="block text-gray-700 text-sm font-bold mb-1"
                >
                  Format:
                </label>
                <div className="relative">
                  <select
                    id="header-format"
                    value={header.format}
                    onChange={(e) =>
                      setHeader({ ...header, format: e.target.value })
                    }
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="TEXT">Text</option>
                    <option value="IMAGE">Image</option>
                    <option value="VIDEO">Video</option>
                    <option value="DOCUMENT">Document</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {header.format === "TEXT" && (
                <div className="mb-2">
                  <label
                    htmlFor="header-text"
                    className="block text-gray-700 text-sm font-bold mb-1"
                  >
                    Header Text:
                  </label>
                  <input
                    type="text"
                    id="header-text"
                    placeholder="Header Text"
                    value={header.text}
                    onChange={(e) =>
                      setHeader({ ...header, text: e.target.value })
                    }
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                  <button
                    type="button"
                    onClick={() => handleInsertVariable(header, setHeader)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-2 rounded inline-flex items-center mt-2"
                  >
                    Insert Variable
                  </button>
                </div>
              )}

              {(header.format === "IMAGE" ||
                header.format === "VIDEO" ||
                header.format === "DOCUMENT") && (
                <div className="mb-2">
                  <label
                    htmlFor="header-url"
                    className="block text-gray-700 text-sm font-bold mb-1"
                  >
                    Header URL:
                  </label>
                  <input
                    type="text"
                    id="header-url"
                    placeholder="Enter URL"
                    value={header.url || ""}
                    onChange={(e) =>
                      setHeader({ ...header, url: e.target.value })
                    }
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Body:
            </label>
            <div className="mb-4 p-4 border rounded-md bg-gray-50">
              <div className="mb-2">
                <label
                  htmlFor="body-text"
                  className="block text-gray-700 text-sm font-bold mb-1"
                >
                  Body Text:
                </label>
                <textarea
                  id="body-text"
                  placeholder="Enter body text"
                  value={body.text}
                  onChange={(e) => setBody({ ...body, text: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                <button
                  type="button"
                  onClick={() => handleInsertVariable(body, setBody)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-2 rounded inline-flex items-center mt-2"
                >
                  Insert Variable
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Footer:
            </label>
            <div className="mb-4 p-4 border rounded-md bg-gray-50">
              <div className="mb-2">
                <label
                  htmlFor="footer-text"
                  className="block text-gray-700 text-sm font-bold mb-1"
                >
                  Footer Text:
                </label>
                <input
                  type="text"
                  id="footer-text"
                  placeholder="Footer Text"
                  value={footer.text}
                  onChange={(e) =>
                    setFooter({ ...footer, text: e.target.value })
                  }
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                <button
                  type="button"
                  onClick={() => handleInsertVariable(footer, setFooter)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-2 rounded inline-flex items-center mt-2"
                >
                  Insert Variable
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Creating..." : "Create Template"}
            </button>
          </div>

          {isError && (
            <div className="text-red-500">
              Error: {error?.message || "Failed to create template"}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateMessageTemplateForm;
