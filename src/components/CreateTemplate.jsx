import React, { useState, useEffect } from "react";
import {
  useCreateTemplateMutation,
  useUploadFileMutation,
  useGetAppDetailsQuery,
} from "../store/adminApiSlice";
import { toast } from "react-toastify";

const CreateMessageTemplateForm = () => {
  const [templateName, setTemplateName] = useState("");
  const [category, setCategory] = useState("marketing");
  const [allowCategoryChange, setAllowCategoryChange] = useState(false);
  const [language, setLanguage] = useState("en_US");
  const [header, setHeader] = useState({
    type: "HEADER",
    format: "TEXT",
    text: "",
    variables: [],
    exampleValues: {},
  });
  const [body, setBody] = useState({
    type: "BODY",
    text: "",
    variables: [],
    exampleValues: {},
  });
  const [footer, setFooter] = useState({
    type: "FOOTER",
    text: "",
    variables: [],
    exampleValues: {},
  });
  const [buttons, setButtons] = useState([
    { type: "PHONE_NUMBER", text: "", phone_number: "" },
    { type: "URL", text: "", url: "" },
  ]);

  const {
    data: appDetails,
    error: appDetailsError,
    isLoading: appDetailsLoading,
  } = useGetAppDetailsQuery();
  // console.log("App Details:", appDetails);
  const [uploadFileMutation, { isLoading: isUploading, error: uploadError }] =
    useUploadFileMutation();
  const [
    createTemplate,
    { isLoading: isCreating, isError, error: createError },
  ] = useCreateTemplateMutation();

  const [mediaId, setMediaId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [appId, setAppId] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    if (appDetails) {
      setAppId(appDetails.data.id);
      setAccessToken(appDetails.accessToken);
      console.log("App ID:", appDetails.data.id); // Log directly from appDetails
      console.log("Access Token:", appDetails.accessToken); // Log directly from appDetails
    } else {
      toast.error("App details are still loading. Please try again.");
      return;
    }
  }, [appDetails]);

  const isValidLanguageCode = (code) => {
    return /^[a-z]{2}_[A-Z]{2}$/.test(code);
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    // toast.success("File selected successfully!"); //remove this
  };

  const uploadHeaderFile = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return null;
    }

    try {
      if (!appId || !accessToken) {
        toast.error("App ID and Access Token are not available.");
        return null;
      }

      const fileData = new FormData();
      fileData.append("file", selectedFile);
      fileData.append("messaging_product", "whatsapp");
      fileData.append("appId", appId);
      fileData.append("token", accessToken);

      const uploadResponse = await uploadFileMutation(fileData).unwrap();
      console.log(
        "Full uploadResponse:",
        JSON.stringify(uploadResponse, null, 2)
      );

      toast.success("File uploaded successfully!");

      if (
        uploadResponse &&
        uploadResponse.uploadResponse &&
        uploadResponse.uploadResponse.h
      ) {
        // <-- Changed this condition
        const mediaId = uploadResponse.uploadResponse.h; // <-- Changed this line to use uploadResponse.h
        setMediaId(mediaId);
        console.log(
          "Using uploadResponse.uploadResponse.h as Media ID:",
          mediaId
        ); // Log the new mediaId
        return mediaId;
      } else {
        console.error("Media ID not found in upload response");
        toast.error("Media ID not found in upload response");
        return null;
      }
    } catch (uploadError) {
      console.error("❌ File upload failed", uploadError);
      console.error(
        "Detailed Upload Error:",
        JSON.stringify(uploadError, null, 2)
      );
      console.error("Error stack:", uploadError.stack);
      toast.error(
        `File upload failed. Check console for details: ${uploadError.message}`
      );
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Only require file selection for non-TEXT headers if no mediaId exists
    if (header.format !== "TEXT" && !selectedFile && !mediaId) {
      toast.error("Please select and upload a file for the header");
      return;
    }

    let formattedTemplateName = templateName
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_");

    if (!formattedTemplateName) {
      toast.error(
        "Template name is invalid. Use alphanumeric and underscores."
      );
      return;
    }

    let formattedCategory = category.toUpperCase();
    const validCategories = ["MARKETING", "UTILITY", "AUTHENTICATION"];

    if (!validCategories.includes(formattedCategory)) {
      toast.error("Invalid category selected.");
      return;
    }

    if (!isValidLanguageCode(language)) {
      toast.error("Invalid language code. Format must be like en_US.");
      return;
    }

    // Log the values we're working with for debugging
    console.log("Creating template with values:", {
      templateName: formattedTemplateName,
      category: formattedCategory,
      language,
      appId,
      accessToken: accessToken ? "Present" : "Missing",
    });

    const formattedComponents = [];

    if (header.format === "TEXT" && header.text) {
      // Text header code remains the same
      const headerComponent = {
        type: "HEADER",
        format: header.format,
        text: header.text,
      };
      if (header.variables.length > 0) {
        headerComponent.example = {
          header_text: [
            header.variables.map((v) => header.exampleValues[v] || "example"),
          ],
        };
      }
      formattedComponents.push(headerComponent);
    } else if (header.format !== "TEXT") {
      // For non-TEXT headers, use the existing mediaId
      let headerMediaId = mediaId;

      // If no mediaId exists yet, try to upload the file
      if (!headerMediaId && selectedFile) {
        headerMediaId = await uploadHeaderFile();
      }

      if (headerMediaId) {
        const headerComponent = {
          type: "HEADER",
          format: header.format,
          example: {
            header_handle: [headerMediaId],
          },
        };

        formattedComponents.push(headerComponent);
        console.log("Media header added with media ID:", headerMediaId);
      } else {
        toast.error("No media uploaded for header");
        return;
      }
    }

    // Body is required
    if (!body.text) {
      toast.error("Body text is required");
      return;
    }

    const bodyComponent = {
      type: "BODY",
      text: body.text,
    };

    if (body.variables.length > 0) {
      bodyComponent.example = {
        body_text: [
          body.variables.map((v) => body.exampleValues[v] || "example"),
        ],
      };
    }

    formattedComponents.push(bodyComponent);

    if (footer.text) {
      const footerComponent = {
        type: "FOOTER",
        text: footer.text,
      };
      if (footer.variables.length > 0) {
        footerComponent.example = {
          footer_text: [
            footer.variables.map((v) => footer.exampleValues[v] || "example"),
          ],
        };
      }
      formattedComponents.push(footerComponent);
    }

    if (buttons && buttons.length > 0) {
      const formattedButtons = buttons
        .filter((button) => button.text)
        .map((button) => {
          const { type, text, url, phone_number } = button;
          const formattedButton = { type, text };
          if (type === "URL") {
            formattedButton.url = url;
            formattedButton.example = [url || "https://example.com"];
          }
          if (type === "PHONE_NUMBER") {
            formattedButton.phone_number = phone_number;
            formattedButton.example = [phone_number || "+1234567890"];
          }
          return formattedButton;
        });

      if (formattedButtons.length > 0) {
        formattedComponents.push({
          type: "BUTTONS",
          buttons: formattedButtons,
        });
      }
    }

    const templateData = {
      name: formattedTemplateName,
      category: formattedCategory,
      allow_category_change: allowCategoryChange,
      language,
      components: formattedComponents,
      parameter_format: "POSITIONAL",
      appId: appId,
      accessToken: accessToken,
    };

    console.log(
      "Template data being sent:",
      JSON.stringify(templateData, null, 2)
    );

    try {
      // Now we pass only the templateData object
      const response = await createTemplate(templateData).unwrap();
      console.log("Template creation response:", response);
      toast.success("Template created successfully!");

      // Reset form after successful creation
      setTemplateName("");
      setCategory("marketing");
      setAllowCategoryChange(false);
      setLanguage("en_US");
      setHeader({
        type: "HEADER",
        format: "TEXT",
        text: "",
        variables: [],
        exampleValues: {},
      });
      setBody({ type: "BODY", text: "", variables: [], exampleValues: {} });
      setFooter({ type: "FOOTER", text: "", variables: [], exampleValues: {} });
      setButtons([
        { type: "PHONE_NUMBER", text: "", phone_number: "" },
        { type: "URL", text: "", url: "" },
      ]);
      setSelectedFile(null);
      setMediaId(null);
    } catch (err) {
      console.error("Error creating template:", err);
      console.error("Detailed error:", JSON.stringify(err, null, 2));
      toast.error(
        `Error creating template: ${
          err?.data?.error?.message || err.message || "Unknown error"
        }`
      );
    }
  };

  const handleInsertVariable = (field, setField) => {
    const currentValue = field.text || "";
    const variableNumber = field.variables.length + 1;
    const newVariable = `{{${variableNumber}}}`;
    const newValue = `${currentValue}${newVariable}`;
    setField((prevState) => ({
      ...prevState,
      text: newValue,
      variables: [...prevState.variables, newVariable],
    }));
  };

  const handleButtonChange = (index, field, value) => {
    const newButtons = [...buttons];
    newButtons[index][field] = value;
    setButtons(newButtons);
  };

  const addButton = () => {
    setButtons([...buttons, { type: "URL", text: "", url: "" }]);
  };

  const removeButton = (index) => {
    const newButtons = [...buttons];
    newButtons.splice(index, 1);
    setButtons(newButtons);
  };

  const buttonTypes = ["PHONE_NUMBER", "URL", "QUICK_REPLY"];

  // Generic handler for variable input changes
  const handleVariableInputChange = (section, variable, value) => {
    switch (section) {
      case "header":
        setHeader((prevState) => ({
          ...prevState,
          exampleValues: { ...prevState.exampleValues, [variable]: value },
        }));
        break;
      case "body":
        setBody((prevState) => ({
          ...prevState,
          exampleValues: { ...prevState.exampleValues, [variable]: value },
        }));
        break;
      case "footer":
        setFooter((prevState) => ({
          ...prevState,
          exampleValues: { ...prevState.exampleValues, [variable]: value },
        }));
        break;
      default:
        break;
    }
  };

  const removeVariable = (section, variableToRemove) => {
    switch (section) {
      case "header":
        setHeader((prevState) => {
          const newVariables = prevState.variables.filter(
            (v) => v !== variableToRemove
          );
          const newExampleValues = { ...prevState.exampleValues };
          delete newExampleValues[variableToRemove];
          return {
            ...prevState,
            text: prevState.text.replace(variableToRemove, ""),
            variables: newVariables,
            exampleValues: newExampleValues,
          };
        });
        break;
      case "body":
        setBody((prevState) => {
          const newVariables = prevState.variables.filter(
            (v) => v !== variableToRemove
          );
          const newExampleValues = { ...prevState.exampleValues };
          delete newExampleValues[variableToRemove];
          return {
            ...prevState,
            text: prevState.text.replace(variableToRemove, ""),
            variables: newVariables,
            exampleValues: newExampleValues,
          };
        });
        break;
      case "footer":
        setFooter((prevState) => {
          const newVariables = prevState.variables.filter(
            (v) => v !== variableToRemove
          );
          const newExampleValues = { ...prevState.exampleValues };
          delete newExampleValues[variableToRemove];
          return {
            ...prevState,
            text: prevState.text.replace(variableToRemove, ""),
            variables: newVariables,
            exampleValues: newExampleValues,
          };
        });
        break;
      default:
        break;
    }
  };

  const renderVariableInputs = (section, field, setField) => {
    return (
      <div>
        {field.variables.map((variable, index) => (
          <div key={index} className="mb-2 flex items-center">
            <label
              htmlFor={`${section}-variable-${index}`}
              className="block text-gray-700 text-sm font-semibold mr-2"
            >
              Example for {variable}:
            </label>
            <input
              type="text"
              id={`${section}-variable-${index}`}
              placeholder={`Enter example for ${variable}`}
              value={field.exampleValues[variable] || ""}
              onChange={(e) =>
                handleVariableInputChange(section, variable, e.target.value)
              }
              className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
            />
            <button
              type="button"
              onClick={() => removeVariable(section, variable)}
              className="bg-red-500 hover:bg-red-700 text-white font-semibold py-0.5 px-1 rounded inline-flex items-center ml-2 text-xs"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    );
  };

  // Function to handle direct upload
  const handleDirectUpload = async () => {
    if (selectedFile) {
      await uploadHeaderFile();
    } else {
      toast.error("Please select a file first.");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen py-6">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-blue-600 py-4 px-6 text-white">
          <h2 className="text-xl font-semibold">Create Message Template</h2>
          <p className="mt-1 text-gray-200 text-sm">
            Define your message template.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Column 1 */}
            <div>
              <div>
                <label
                  htmlFor="templateName"
                  className="block text-gray-700 text-sm font-semibold mb-1"
                >
                  Template Name:
                </label>
                <input
                  type="text"
                  id="templateName"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
                  placeholder="Enter template name"
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-gray-700 text-sm font-semibold mb-1"
                >
                  Category:
                </label>
                <div className="relative">
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
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
                  className="mr-1 leading-tight h-4 w-4"
                />
                <label
                  htmlFor="allowCategoryChange"
                  className="text-gray-700 text-sm font-semibold"
                >
                  Allow Category Change
                </label>
              </div>

              <div>
                <label
                  htmlFor="language"
                  className="block text-gray-700 text-sm font-semibold mb-1"
                >
                  Language:
                </label>
                <input
                  type="text"
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
                  placeholder="e.g., en_US"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-1">
                  Body:
                </label>
                <div className="mb-2 p-2 border rounded-md bg-gray-50">
                  <div className="mb-1">
                    <label
                      htmlFor="body-text"
                      className="block text-gray-700 text-sm font-semibold mb-1"
                    >
                      Body Text:
                    </label>
                    <textarea
                      id="body-text"
                      placeholder="Enter body text"
                      value={body.text}
                      onChange={(e) =>
                        setBody({ ...body, text: e.target.value })
                      }
                      className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm h-24" // Added h-24 for some height
                    />
                    <button
                      type="button"
                      onClick={() => handleInsertVariable(body, setBody)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-0.5 px-1 rounded inline-flex items-center mt-1 text-xs"
                    >
                      Insert Variable
                    </button>
                  </div>
                  {renderVariableInputs("body", body, setBody)}
                </div>
              </div>
            </div>

            {/* Column 2 */}
            <div>
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-1">
                  Header:
                </label>
                <div className="mb-2 p-2 border rounded-md bg-gray-50">
                  <div className="mb-1">
                    <label
                      htmlFor="header-format"
                      className="block text-gray-700 text-sm font-semibold mb-1"
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
                        className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
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
                    <div className="mb-1">
                      <label
                        htmlFor="header-text"
                        className="block text-gray-700 text-sm font-semibold mb-1"
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
                        className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleInsertVariable(header, setHeader)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-0.5 px-1 rounded inline-flex items-center mt-1 text-xs"
                      >
                        Insert Variable
                      </button>
                    </div>
                  )}
                  {header.format === "TEXT" &&
                    renderVariableInputs("header", header, setHeader)}

                  {(header.format === "IMAGE" ||
                    header.format === "VIDEO" ||
                    header.format === "DOCUMENT") && (
                    <div className="mb-1">
                      <label
                        htmlFor="header-file"
                        className="block text-gray-700 text-sm font-semibold mb-1"
                      >
                        Header File:
                      </label>
                      <input
                        type="file"
                        id="header-file"
                        onChange={(e) => handleFileSelect(e.target.files[0])}
                        className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
                        accept="image/*,video/*,application/pdf"
                      />
                      {selectedFile && (
                        <p className="text-xs">Selected: {selectedFile.name}</p>
                      )}
                      {isUploading && <p className="text-xs">Uploading...</p>}
                      {uploadError && (
                        <p className="text-red-500 text-xs">Upload failed</p>
                      )}
                      {appDetailsLoading && (
                        <p className="text-xs">Loading...</p>
                      )}
                      {appDetailsError && (
                        <p className="text-red-500 text-xs">
                          Error: {appDetailsError.message}
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={handleDirectUpload}
                        disabled={isUploading || !selectedFile}
                        className={`bg-blue-500 hover:bg-blue-700 text-white font-semibold py-1 px-2 rounded focus:outline-none focus:shadow-outline text-sm mt-2 ${
                          isUploading || !selectedFile
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        {isUploading ? "Uploading..." : "Upload File"}
                      </button>
                      {mediaId && (
                        <p className="text-green-500 text-xs mt-1">
                          File uploaded. Media ID: {mediaId}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-1">
                  Footer:
                </label>
                <div className="mb-2 p-2 border rounded-md bg-gray-50">
                  <div className="mb-1">
                    <label
                      htmlFor="footer-text"
                      className="block text-gray-700 text-sm font-semibold mb-1"
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
                      className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleInsertVariable(footer, setFooter)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-0.5 px-1 rounded inline-flex items-center mt-1 text-xs"
                    >
                      Insert Variable
                    </button>
                  </div>
                  {renderVariableInputs("footer", footer, setFooter)}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-1">
                  Buttons:
                </label>
                {buttons.map((button, index) => (
                  <div
                    key={index}
                    className="mb-2 p-2 border rounded-md bg-gray-50"
                  >
                    <div className="mb-1">
                      <label
                        htmlFor={`button-type-${index}`}
                        className="block text-gray-700 text-sm font-semibold mb-1"
                      >
                        Button {index + 1} Type:
                      </label>
                      <select
                        id={`button-type-${index}`}
                        value={button.type}
                        onChange={(e) =>
                          handleButtonChange(index, "type", e.target.value)
                        }
                        className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
                      >
                        {buttonTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-1">
                      <label
                        htmlFor={`button-text-${index}`}
                        className="block text-gray-700 text-sm font-semibold mb-1"
                      >
                        Button {index + 1} Text:
                      </label>
                      <input
                        type="text"
                        id={`button-text-${index}`}
                        placeholder="Button Text"
                        value={button.text}
                        onChange={(e) =>
                          handleButtonChange(index, "text", e.target.value)
                        }
                        className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
                      />
                    </div>

                    {button.type === "URL" && (
                      <div className="mb-1">
                        <label
                          htmlFor={`button-url-${index}`}
                          className="block text-gray-700 text-sm font-semibold mb-1"
                        >
                          Button {index + 1} URL:
                        </label>
                        <input
                          type="url"
                          id={`button-url-${index}`}
                          placeholder="Button URL"
                          value={button.url}
                          onChange={(e) =>
                            handleButtonChange(index, "url", e.target.value)
                          }
                          className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
                        />
                      </div>
                    )}

                    {button.type === "PHONE_NUMBER" && (
                      <div className="mb-1">
                        <label
                          htmlFor={`button-phone-${index}`}
                          className="block text-gray-700 text-sm font-semibold mb-1"
                        >
                          Button {index + 1} Phone:
                        </label>
                        <input
                          type="tel"
                          id={`button-phone-${index}`}
                          placeholder="Phone Number"
                          value={button.phone_number}
                          onChange={(e) =>
                            handleButtonChange(
                              index,
                              "phone_number",
                              e.target.value
                            )
                          }
                          className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
                        />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => removeButton(index)}
                      className="bg-red-500 hover:bg-red-700 text-white font-semibold py-0.5 px-1 rounded inline-flex items-center mt-1 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addButton}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-1 px-2 rounded focus:outline-none focus:shadow-outline text-sm"
                >
                  Add Button
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={isCreating || isUploading}
              className={`bg-green-500 hover:bg-green-700 text-white font-semibold py-1 px-2 rounded focus:outline-none focus:shadow-outline text-sm ${
                isCreating || isUploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isCreating
                ? "Creating..."
                : isUploading
                ? "Uploading..."
                : "Create"}
            </button>
          </div>

          {isError && (
            <div className="text-red-500 text-sm">
              Error: {createError?.message || "Failed to create"}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateMessageTemplateForm;
