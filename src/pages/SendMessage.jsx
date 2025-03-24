import React, { useState, useEffect, useRef } from "react";
import {
  useSendMessageMutation,
  useGetTemplatesQuery,
  useGetMessagesQuery,
  useGetPhoneNumbersQuery,
  useGetSessionStatusQuery, // Import the new hook
} from "../store/adminApiSlice";
import Swal from "sweetalert2";
import { IoPaperPlaneOutline } from "react-icons/io5";
import { ImWhatsapp } from "react-icons/im";
import { FaSpinner } from "react-icons/fa";

const SendMessageForm = ({ selectedCategory }) => {
  // Existing state variables...
  const [formData, setFormData] = useState({
    messaging_product: "whatsapp",
    to: "",
    type: "text",
    text: { body: "" },
  });

  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [templateParams, setTemplateParams] = useState({});
  const [previewMessage, setPreviewMessage] = useState("Your message here...");
  const [platform, setPlatform] = useState("android");
  const chatContainerRef = useRef(null);
  const messageInputRef = useRef(null);
  const [selectedSender, setSelectedSender] = useState("");
  const [businessPhoneNumberId, setBusinessPhoneNumberId] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [imageDataMap, setImageDataMap] = useState({});
  const [imageLoading, setImageLoading] = useState({});
  const [imageUrlInput, setImageUrlInput] = useState("");

  // New state variable for session status
  const [sessionStatus, setSessionStatus] = useState(null);

  const [
    sendMessage,
    { isLoading, isError: isSendMessageError, error: sendMessageError },
  ] = useSendMessageMutation();

  // getting templates
  const {
    data: templates,
    isTemplatesLoading,
    isTemplatesError,
    error: templatesError,
  } = useGetTemplatesQuery(selectedCategory);

  // getting phone numbers
  const {
    data: phoneNumbersData,
    isLoading: isPhoneNumbersLoading,
    isPhoneNumbersError,
    error: phoneNumbersError,
  } = useGetPhoneNumbersQuery();

  const phoneNumbers = phoneNumbersData?.data || [];

  useEffect(() => {
    if (phoneNumbers.length > 0) {
      setBusinessPhoneNumberId(phoneNumbers[0].display_phone_number);
      setSelectedSender(phoneNumbers[0].display_phone_number);
    }
  }, [phoneNumbers]);

  const {
    data: messages,
    isLoading: isMessagesLoading,
    error: messagesError,
    refetch,
  } = useGetMessagesQuery(
    businessPhoneNumberId
      ? {
          receiver: formData.to,
          sender: businessPhoneNumberId,
        }
      : { skip: true }
  );
  console.log("messages", messages);

  // Use getSessionStatus query
  const {
    data: sessionData,
    isLoading: isSessionLoading,
    isError: isSessionError,
    error: sessionError,
    refetch: refetchSession,
  } = useGetSessionStatusQuery(formData.to, { skip: !formData.to }); // Only fetch if formData.to is not empty

  useEffect(() => {
    if (sessionData) {
      setSessionStatus(sessionData);
    }
  }, [sessionData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (businessPhoneNumberId && formData.to) {
        refetch();
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [refetch, businessPhoneNumberId, formData.to]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (formData.to) {
        refetchSession();
      }
    }, 60000); // Refetch session status every 60 seconds

    return () => clearInterval(intervalId);
  }, [refetchSession, formData.to]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "to") {
      setFormData((prev) => ({
        ...prev,
        to: value,
      }));
    } else if (name === "body") {
      // Directly update preview message when custom message is entered
      setPreviewMessage(value);
      setFormData((prev) => ({
        ...prev,
        text: { body: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleTemplateChange = (e) => {
    const templateName = e.target.value;
    setSelectedTemplate(templateName);
    setImageDataMap({});
    setImageLoading({});

    const selectedTemplateData = templates?.find(
      (template) => template.name === templateName
    );

    if (selectedTemplateData) {
      let params = {};

      const bodyComponent = selectedTemplateData.components?.find(
        (comp) => comp.type === "BODY"
      );

      if (bodyComponent) {
        const placeholderRegex = /{{(\d+)}}/g;
        let match;
        let maxPlaceholderNumber = 0;

        while ((match = placeholderRegex.exec(bodyComponent.text)) !== null) {
          const placeholderNumber = parseInt(match[1], 10);
          maxPlaceholderNumber = Math.max(
            maxPlaceholderNumber,
            placeholderNumber
          );
        }

        for (let i = 1; i <= maxPlaceholderNumber; i++) {
          params[i] = "";
        }
      }

      setTemplateParams(params); // Update Template Params
      updatePreviewFromTemplate(params, selectedTemplateData); // Update Preview after updating template params
    } else {
      setTemplateParams({});
      setPreviewMessage("Your message here...");
    }
    setImageUrlInput("");
  };

  const updatePreviewFromTemplate = (params, selectedTemplateData) => {
    if (!selectedTemplateData) return;

    const bodyComponent = selectedTemplateData.components?.find(
      (comp) => comp.type === "BODY"
    );

    if (bodyComponent && bodyComponent.text) {
      let preview = bodyComponent.text;

      // Replace placeholders with parameter values or colored placeholders
      for (const paramName in params) {
        const placeholder = `{{${paramName}}}`;
        if (params[paramName]) {
          // If parameter has a value, show it in green
          preview = preview.replace(
            placeholder,
            `<span style="color: #4ade80; font-weight: bold;">${params[paramName]}</span>`
          );
        } else {
          // If parameter is empty, show placeholder in orange
          preview = preview.replace(
            placeholder,
            `<span style="color: #fb923c; font-weight: bold;">${placeholder}</span>`
          );
        }
      }

      // Use dangerouslySetInnerHTML to render the HTML in the preview
      setPreviewMessage(preview || "Template Preview");
    } else {
      setPreviewMessage("Template does not have a body component with text.");
    }
  };
  const handleParamChange = (e) => {
    const { name, value } = e.target;

    // Create a new object to ensure React detects the change
    const newParams = {
      ...templateParams,
      [name]: value,
    };

    // Update the template parameters state
    setTemplateParams(newParams);

    // Immediately update the preview message
    const selectedTemplateData = templates?.find(
      (template) => template.name === selectedTemplate
    );
    if (selectedTemplateData) {
      updatePreviewFromTemplate(newParams, selectedTemplateData);
    }
  };
  const scrollToBottom = () => {
    chatContainerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const resetForm = () => {
    setSelectedTemplate("");
    setTemplateParams({});
    setPreviewMessage("Your message here...");
    setImageUrlInput("");
    if (messageInputRef.current) {
      messageInputRef.current.value = "";
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!businessPhoneNumberId) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Business phone number not loaded yet. Please wait.",
        });
        return;
      }
      if (!selectedSender) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Please select a sender number.",
        });
        return;
      }

      if (!formData.to) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Please enter a recipient phone number.",
        });
        return;
      }

      // Validate phone number format - ensure it has country code
      const phoneRegex = /^\d+$/;
      if (!phoneRegex.test(formData.to.replace(/\+/g, ""))) {
        Swal.fire({
          icon: "error",
          title: "Invalid Phone Number",
          text: "Please enter a valid phone number (digits only, with optional + prefix).",
        });
        return;
      }

      let messageBody = {
        messaging_product: "whatsapp",
        to: formData.to,
        sender: selectedSender,
        recipient_type: "individual", // Add this required field
      };

      if (selectedTemplate) {
        // Sending a template message
        messageBody.type = "template";
        const selectedTemplateData = templates?.find(
          (template) => template.name === selectedTemplate
        );

        if (!selectedTemplateData) {
          Swal.fire({
            icon: "error",
            title: "Template Error!",
            text: "Selected template not found. Please choose a valid template.",
          });
          return;
        }

        let components = [];

        // Handle image header
        const headerComponent = selectedTemplateData.components?.find(
          (comp) => comp.type === "HEADER" && comp.format === "IMAGE"
        );

        if (headerComponent) {
          if (!imageUrlInput) {
            Swal.fire({
              icon: "error",
              title: "Image Required",
              text: "This template requires an image. Please provide an image URL.",
            });
            return;
          }

          components.push({
            type: "header", // Use lowercase as per WhatsApp API requirements
            parameters: [
              {
                type: "image",
                image: {
                  link: imageUrlInput,
                },
              },
            ],
          });
        }

        const bodyComponent = selectedTemplateData.components?.find(
          (comp) => comp.type === "BODY"
        );

        if (bodyComponent) {
          // Validate that all required parameters have values
          const missingParams = Object.keys(templateParams).filter(
            (key) => !templateParams[key] && templateParams[key] !== 0
          );

          if (missingParams.length > 0) {
            Swal.fire({
              icon: "error",
              title: "Missing Parameters",
              text: `Please fill in all template parameters: ${missingParams.join(
                ", "
              )}`,
            });
            return;
          }

          const parameters = Object.keys(templateParams).map((key) => ({
            type: "text",
            text: templateParams[key],
          }));

          if (parameters.length > 0) {
            components.push({
              type: "body", // Use lowercase as per WhatsApp API requirements
              parameters: parameters,
            });
          }
        }

        messageBody.template = {
          name: selectedTemplate,
          language: {
            code: "en_US",
          },
        };

        // Only add components if there are any
        if (components.length > 0) {
          messageBody.template.components = components;
        }

        // Log the complete message body for debugging
        console.log(
          "Template message payload:",
          JSON.stringify(messageBody, null, 2)
        );
      } else {
        // Sending a text message
        if (!formData.text.body || formData.text.body.trim() === "") {
          Swal.fire({
            icon: "error",
            title: "Empty Message",
            text: "Please enter a message to send.",
          });
          return;
        }

        messageBody.type = "text";
        messageBody.text = { body: formData.text.body };

        // Log the complete message body for debugging
        console.log(
          "Text message payload:",
          JSON.stringify(messageBody, null, 2)
        );
      }

      // Check session status before sending message
      if (
        !selectedTemplate &&
        sessionStatus &&
        !sessionStatus.hasActiveSession
      ) {
        Swal.fire({
          icon: "error",
          title: "Session Expired",
          text: `The 24-hour session with this number has expired. Please use a template message or wait for the user to initiate a new session. Session expired
           ${new Date(sessionStatus?.sessionExpiresAt).toLocaleTimeString()}
           , remaining time ${sessionStatus?.timeRemaining}`,
        });
        return;
      }

      setApiError(null);
      const response = await sendMessage(messageBody).unwrap();
      console.log("Message sent successfully:", response);

      refetch();
      Swal.fire({
        icon: "success",
        title: "Message Sent!",
        text: "Your message has been successfully delivered.",
      });
      resetForm();
    } catch (err) {
      console.error("Error sending message:", err);

      let errorMessage =
        "There was an issue sending the message. Please check your inputs and try again.";
      let errorDetails = "";

      if (err.data) {
        errorMessage = err.data.message || errorMessage;
        errorDetails = JSON.stringify(err.data.details || err.data, null, 2);
      }

      setApiError(err);
      Swal.fire({
        icon: "error",
        title: "Sending Failed!",
        text: errorMessage,
        footer: errorDetails
          ? `<pre style="text-align: left; max-height: 200px; overflow-y: auto;">${errorDetails}</pre>`
          : undefined,
      });
    }
  };
  const handleMessageInput = (e) => {
    const { value } = e.target;

    setPreviewMessage(value); // Update the preview immediately
    setFormData((prev) => ({
      ...prev,
      text: { body: value },
    }));
  };

  const getPhoneContainerStyle = () => {
    switch (platform) {
      case "android":
        return {
          background: "#f0f0f0",
          borderRadius: "20px",
          padding: "10px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          width: "380px",
        };
      case "apple":
        return {
          background: "#ffffff",
          borderRadius: "30px",
          padding: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          width: "380px",
        };
      default:
        return {};
    }
  };

  const getScreenStyle = () => {
    return {
      background: "white",
      borderRadius: platform === "android" ? "10px" : "20px",
      overflow: "hidden",
      height: "600px",
      display: "flex",
      flexDirection: "column",
    };
  };

  const loadImageData = async (imageUrl) => {
    if (!imageUrl || imageDataMap[imageUrl] || imageLoading[imageUrl]) {
      return;
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
    if (selectedTemplate) {
      const selectedTemplateData = templates?.find(
        (template) => template.name === selectedTemplate
      );

      selectedTemplateData?.components
        ?.filter((comp) => comp.type === "HEADER" && comp.format === "IMAGE")
        .forEach((comp) => {
          comp?.example?.header_handle?.forEach((imageUrl) => {
            if (imageUrl && !imageDataMap[imageUrl]) {
              loadImageData(imageUrl);
            }
          });
        });
    }
  }, [selectedTemplate, templates]);

  const hasImageHeader = () => {
    if (!selectedTemplate) return false;
    const selectedTemplateData = templates?.find(
      (template) => template.name === selectedTemplate
    );
    return !!selectedTemplateData?.components?.find(
      (comp) => comp.type === "HEADER" && comp.format === "IMAGE"
    );
  };

  // Add this helper function to render message status indicators
  const renderMessageStatus = (msg) => {
    if (!msg.status || !msg.direction || msg.direction !== "sent") {
      return null;
    }

    let statusIcon = null;
    let statusText = "";
    let statusColor = "text-gray-400";

    switch (msg.status) {
      case "sent":
        statusIcon = "✓";
        statusText = "Sent";
        statusColor = "text-gray-400";
        break;
      case "delivered":
        statusIcon = "✓✓";
        statusText = "Delivered";
        statusColor = "text-gray-400";
        break;
      case "read":
        statusIcon = "✓✓";
        statusText = "Read";
        statusColor = "text-blue-400";
        break;
      case "failed":
        statusIcon = "!";
        statusText = "Failed";
        statusColor = "text-red-500";
        break;
      default:
        statusIcon = "⋯";
        statusText = "Sending";
        statusColor = "text-gray-400";
    }

    return (
      <div
        className={`flex items-center justify-end mt-1 text-xs ${statusColor}`}
      >
        <span className="mr-1">{statusText}</span>
        <span className="font-bold">{statusIcon}</span>
        {msg.deliveryInfo?.readAt && (
          <span className="ml-2 text-xs">
            {new Date(msg.deliveryInfo.readAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen w-screen bg-gray-50 text-gray-900">
      {/* Left Panel - Message Configuration */}
      <div className="w-full md:w-1/2 p-6 overflow-y-auto max-h-screen">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">
            Configure Message
          </h2>

          {/* Platform Selector */}
          <div className="mb-6">
            <label
              htmlFor="platform"
              className="block text-sm font-medium text-gray-600 mb-2"
            >
              Platform
            </label>
            <div className="relative">
              <select
                id="platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-700 appearance-none transition duration-200"
              >
                <option value="android">Android</option>
                <option value="apple">Apple</option>
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Recipient Number */}
            <div>
              <label
                htmlFor="recipientNumber"
                className="block text-sm font-medium text-gray-600 mb-2"
              >
                Recipient Number
              </label>
              <input
                type="text"
                id="recipientNumber"
                name="to"
                placeholder="e.g., +15551234567"
                value={formData.to}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 placeholder-gray-400 transition duration-200"
                required
              />
            </div>

            {/* Session Status Display */}
            {formData.to && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Session Status
                </label>
                {isSessionLoading ? (
                  <p className="text-gray-500">Loading session status...</p>
                ) : isSessionError ? (
                  <p className="text-red-600">
                    Error: {sessionError?.data?.message || sessionError.message}
                  </p>
                ) : sessionStatus ? (
                  <div>
                    <p className="text-green-600">
                      Session Active:{" "}
                      {sessionStatus.hasActiveSession ? "Yes" : "No"}
                    </p>
                    {sessionStatus.hasActiveSession ? (
                      <p className="text-gray-600">
                        Expires In: {sessionStatus.timeRemaining} minutes
                      </p>
                    ) : (
                      <p className="text-gray-600">
                        Session Expired:{" "}
                        {new Date(
                          sessionStatus.sessionExpiresAt
                        ).toLocaleString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No session data available.</p>
                )}
              </div>
            )}

            {/* Sender Selector */}
            <div>
              <label
                htmlFor="sender"
                className="block text-sm font-medium text-gray-600 mb-2"
              >
                Sender Number
              </label>
              <div className="relative">
                <select
                  id="sender"
                  value={selectedSender}
                  onChange={(e) => setSelectedSender(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-700 appearance-none transition duration-200"
                  required
                >
                  <option value="">Select a Sender</option>
                  {phoneNumbers?.map((number) => (
                    <option key={number.id} value={number.display_phone_number}>
                      {number.display_phone_number}
                    </option>
                  ))}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </div>
              {isPhoneNumbersLoading && (
                <p className="text-sm text-gray-500 mt-2">
                  Loading sender numbers...
                </p>
              )}
              {isPhoneNumbersError && (
                <p className="text-sm text-red-600 mt-2">
                  Error: {phoneNumbersError.message}
                </p>
              )}
            </div>

            {/* Image URL Input */}
            {(() => {
              if (selectedTemplate) {
                const template = templates?.find(
                  (t) => t.name === selectedTemplate
                );
                if (
                  template?.components?.some(
                    (comp) => comp.type === "HEADER" && comp.format === "IMAGE"
                  )
                ) {
                  return (
                    <div>
                      <label
                        htmlFor="imageUrl"
                        className="block text-sm font-medium text-gray-600 mb-2"
                      >
                        Image URL
                      </label>
                      <input
                        type="url"
                        id="imageUrl"
                        name="imageUrl"
                        placeholder="Enter image URL"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 placeholder-gray-400 transition duration-200"
                      />
                    </div>
                  );
                }
              }
              return null;
            })()}

            {/* Message Input or Template Parameters */}
            {!selectedTemplate ? (
              <div></div>
            ) : (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-3">
                  Template Parameters
                </p>
                <div className="space-y-4">
                  {Object.entries(templateParams).map(([paramName, value]) => (
                    <div key={paramName}>
                      <label
                        htmlFor={`param-${paramName}`}
                        className="block text-sm font-medium text-gray-600 mb-1.5"
                      >
                        {paramName}
                      </label>
                      <input
                        type="text"
                        id={`param-${paramName}`}
                        name={paramName}
                        placeholder={`Enter ${paramName}`}
                        value={value}
                        onChange={handleParamChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 placeholder-gray-400 transition duration-200"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Right Panel - WhatsApp Preview */}
      <div className="w-3/5 p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            WhatsApp Preview
          </h2>

          <div style={getPhoneContainerStyle()} className="mx-auto">
            <div
              style={getScreenStyle()}
              className="bg-gray-900 text-white rounded-lg shadow-lg flex flex-col h-[600px] overflow-hidden"
            >
              {/* WhatsApp Header */}
              <div className="bg-gradient-to-r from-green-500 to-green-700 text-white p-4 flex items-center justify-between rounded-t-lg">
                <span className="font-semibold text-lg">WhatsApp</span>
                <ImWhatsapp
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/2044px-WhatsApp.svg.png"
                  alt="WhatsApp Logo"
                  className="w-8 h-8"
                />
              </div>

              {/* Chat Messages */}
              <div
                className="p-4 flex-grow bg-gray-800"
                style={{
                  overflowY: "scroll",
                  scrollBehavior: "smooth",
                  overscrollBehavior: "contain",
                }}
              >
                {apiError ? (
                  <div className="text-red-400 p-3 bg-red-900 rounded-md">
                    Something went wrong. Please try again later.
                  </div>
                ) : isMessagesLoading ? (
                  <p className="text-gray-400">Loading messages...</p>
                ) : messagesError ? (
                  <p className="text-green-400">
                    No Messages yet Let's make a chat
                  </p>
                ) : (
                  // Display messages here
                  messages?.map((msg) => (
                    <div
                      key={msg._id}
                      className={`message flex ${
                        msg.sender === selectedSender
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className="flex flex-col"
                        style={{ maxWidth: "75%" }}
                      >
                        <div
                          className={`p-3 rounded-lg shadow ${
                            msg.sender === selectedSender
                              ? "bg-green-500 text-white"
                              : "bg-gray-700 text-white"
                          }`}
                          style={{
                            marginBottom: "2px",
                          }}
                        >
                          {/* Regular text message */}
                          {msg.type === "text" &&
                            (msg.body || (msg.text && msg.text.body))}

                          {/* Template message */}
                          {msg.type === "template" && (
                            <div className="template-message">
                              {/* Display template components */}
                              {msg.template?.components && (
                                <div className="flex flex-col">
                                  {/* Header component (image) */}
                                  {msg.template.components.map((comp, idx) => {
                                    if (
                                      (comp.type === "HEADER" ||
                                        comp.type === "header") &&
                                      comp.parameters &&
                                      comp.parameters[0]?.type === "image"
                                    ) {
                                      return (
                                        <div
                                          key={`header-${idx}`}
                                          className="mb-2"
                                        >
                                          <img
                                            src={comp.parameters[0].image.link}
                                            alt="Template Header"
                                            className="rounded-lg w-full h-auto"
                                            style={{
                                              maxHeight: "200px",
                                              objectFit: "cover",
                                            }}
                                          />
                                        </div>
                                      );
                                    }
                                    return null;
                                  })}

                                  {/* Body component with parameters */}
                                  {msg.template.components.map((comp, idx) => {
                                    if (
                                      comp.type === "BODY" ||
                                      comp.type === "body"
                                    ) {
                                      // Get the template definition to extract the original text with placeholders
                                      const templateDef = templates?.find(
                                        (t) => t.name === msg.template.name
                                      );
                                      const bodyTemplate =
                                        templateDef?.components?.find(
                                          (c) => c.type === "BODY"
                                        );

                                      if (bodyTemplate && bodyTemplate.text) {
                                        let formattedText = bodyTemplate.text;

                                        // Replace placeholders with actual values
                                        if (
                                          comp.parameters &&
                                          comp.parameters.length > 0
                                        ) {
                                          comp.parameters.forEach(
                                            (param, paramIdx) => {
                                              if (param.type === "text") {
                                                const placeholder = `{{${
                                                  paramIdx + 1
                                                }}}`;
                                                formattedText =
                                                  formattedText.replace(
                                                    placeholder,
                                                    `<span class="font-semibold text-green-300">${param.text}</span>`
                                                  );
                                              }
                                            }
                                          );
                                        }

                                        return (
                                          <div
                                            key={`body-${idx}`}
                                            dangerouslySetInnerHTML={{
                                              __html: formattedText,
                                            }}
                                            className="template-body"
                                          />
                                        );
                                      } else {
                                        // Fallback if template definition not found
                                        return (
                                          <div
                                            key={`body-${idx}`}
                                            className="template-body"
                                          >
                                            {comp.parameters &&
                                            comp.parameters.length > 0
                                              ? comp.parameters.map(
                                                  (param, paramIdx) =>
                                                    param.type === "text" && (
                                                      <div
                                                        key={`param-${paramIdx}`}
                                                        className="mb-1"
                                                      >
                                                        {param.text}
                                                      </div>
                                                    )
                                                )
                                              : comp.text || "Hello World"}
                                          </div>
                                        );
                                      }
                                    }
                                    return null;
                                  })}

                                  {/* Footer component */}
                                  {msg.template.components.map((comp, idx) => {
                                    if (
                                      comp.type === "FOOTER" ||
                                      comp.type === "footer"
                                    ) {
                                      return (
                                        <div
                                          key={`footer-${idx}`}
                                          className="text-xs text-gray-300 mt-2 italic"
                                        >
                                          {comp.text}
                                        </div>
                                      );
                                    }
                                    return null;
                                  })}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Fallback if no content found */}
                          {!msg.type &&
                            !msg.body &&
                            !msg.text?.body &&
                            !msg.template && (
                              <span className="text-gray-300 italic">
                                No message content
                              </span>
                            )}
                        </div>

                        {/* Add message status indicator */}
                        {msg.sender === selectedSender &&
                          renderMessageStatus(msg)}

                        {/* Add timestamp for received messages */}
                        {msg.sender !== selectedSender && msg.timestamp && (
                          <div className="text-xs text-gray-400 mt-1 ml-1">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}

                <div ref={chatContainerRef}></div>

                {selectedTemplate && (
                  <div className="mt-4">
                    {/* Image Preview */}
                    {(() => {
                      const template = templates?.find(
                        (t) => t.name === selectedTemplate
                      );

                      // Check if the template has an image header
                      const hasImageHeader = template?.components?.some(
                        (comp) =>
                          comp.type === "HEADER" && comp.format === "IMAGE"
                      );

                      if (hasImageHeader) {
                        return (
                          <div>
                            {imageUrlInput ? (
                              // Display user-provided image if available
                              <img
                                src={imageUrlInput}
                                alt="Template Header"
                                className="rounded-lg w-full h-auto mb-2"
                              />
                            ) : (
                              // Display placeholder image if no user-provided image
                              <img
                                src="src\items\images\placeholder-iamge.jpg"
                                alt="Placeholder Image"
                                className="rounded-lg w-full h-auto mb-2"
                              />
                            )}
                          </div>
                        );
                      }

                      return null;
                    })()}

                    {/* Message Preview */}
                    <div className="p-3 bg-gray-700 rounded-md transition-all hover:bg-gray-600">
                      <div
                        dangerouslySetInnerHTML={{ __html: previewMessage }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input Area (Moved Inside Preview) */}
              <form
                onSubmit={handleSubmit}
                className="p-4 bg-gray-700 rounded-b-lg flex items-center"
              >
                {/* Template Selector in Input */}
                <div className="relative flex-grow">
                  <select
                    id="template"
                    value={selectedTemplate || ""}
                    onChange={handleTemplateChange}
                    className="block appearance-none w-full bg-gray-600 border border-gray-500 hover:border-gray-400 text-white py-3 px-4 pr-8 rounded-full leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="">Use Custom Message</option>
                    {templates?.map(
                      (template) =>
                        template.status === "APPROVED" && (
                          <option key={template.name} value={template.name}>
                            {template.name}
                          </option>
                        )
                    )}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-300">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
                <input
                  type="text"
                  id="messageInput"
                  name="body"
                  placeholder="Type a message..."
                  onChange={handleMessageInput}
                  ref={messageInputRef}
                  className="flex-grow p-3 rounded-full bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500 ml-3"
                  required={!selectedTemplate} // Only require if not using a template
                />
                <button
                  type="submit"
                  className="mr-1 ml-2 p-3 rounded-full bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                  aria-label="Send"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <FaSpinner className="animate-spin h-5 w-5 text-white" />
                  ) : (
                    <IoPaperPlaneOutline
                      fill="currentColor"
                      className="w-6 h-6 text-white transform rotate-45"
                    />
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendMessageForm;
