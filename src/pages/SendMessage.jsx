import React, { useState, useEffect, useRef } from "react";
import {
  useSendMessageMutation,
  useGetTemplatesQuery,
  useGetMessagesQuery,
} from "../store/adminApiSlice";

const SendMessageForm = ({ selectedCategory }) => {
  const [formData, setFormData] = useState({
    messaging_product: "whatsapp",
    to: "",
    type: "text",
    text: { body: "" },
  });
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateParams, setTemplateParams] = useState({});
  const [previewMessage, setPreviewMessage] = useState("Your message here...");
  const [platform, setPlatform] = useState("android");
  const chatContainerRef = useRef(null);

  const [
    sendMessage,
    { isLoading, isError: isSendMessageError, error: sendMessageError },
  ] = useSendMessageMutation();
  const {
    data: templates,
    isTemplatesLoading,
    isTemplatesError,
  } = useGetTemplatesQuery(selectedCategory);

  const {
    data: messages,
    isLoading: isMessagesLoading,
    error: messagesError,
    refetch,
  } = useGetMessagesQuery(formData.to, {
    skip: !formData.to,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "body") {
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

    const selectedTemplateData = templates?.find(
      (template) => template.name === templateName
    );

    if (selectedTemplateData) {
      let params = {};

      const bodyComponent = selectedTemplateData.components?.find(
        (comp) => comp.type === "BODY"
      );

      if (bodyComponent) {
        if (selectedTemplateData.parameter_format === "NAMED") {
          bodyComponent.example?.body_text_named_params?.forEach((param) => {
            params[param.param_name] = "";
          });
        } else if (selectedTemplateData.parameter_format === "POSITIONAL") {
          if (
            bodyComponent.example?.body_text &&
            Array.isArray(bodyComponent.example.body_text)
          ) {
            const textArray = bodyComponent.example.body_text[0];

            if (Array.isArray(textArray)) {
              for (let i = 0; i < textArray.length; i++) {
                params[i + 1] = "";
              }
            }
          }
        }
      }

      setTemplateParams(params);
      updatePreviewFromTemplate(params, selectedTemplateData);
    } else {
      setTemplateParams({});
      setPreviewMessage("Your message here...");
    }
  };

  const updatePreviewFromTemplate = (params, selectedTemplateData) => {
    if (!selectedTemplateData) return;

    const bodyComponent = selectedTemplateData.components?.find(
      (comp) => comp.type === "BODY"
    );

    if (bodyComponent) {
      let preview = bodyComponent.example?.body_text?.[0];

      if (selectedTemplateData.parameter_format === "NAMED") {
        bodyComponent.example?.body_text_named_params?.forEach((param) => {
          const placeholder = `{{${param.param_name}}}`;
          preview = preview?.replace(
            placeholder,
            params[param.param_name] || ""
          );
        });
      } else if (selectedTemplateData.parameter_format === "POSITIONAL") {
        if (
          bodyComponent.example?.body_text &&
          Array.isArray(bodyComponent.example.body_text)
        ) {
          const textArray = bodyComponent.example.body_text[0];

          if (Array.isArray(textArray)) {
            for (let i = 0; i < textArray.length; i++) {
              preview = preview?.replace(`{{${i + 1}}}`, params[i + 1] || "");
            }
          }
        }
      }

      setPreviewMessage(preview || "Template Preview");
    }
  };

  const handleParamChange = (e) => {
    const newParams = {
      ...templateParams,
      [e.target.name]: e.target.value,
    };

    setTemplateParams(newParams);
    const selectedTemplateData = templates?.find(
      (template) => template.name === selectedTemplate
    );
    if (selectedTemplateData) {
      updatePreviewFromTemplate(newParams, selectedTemplateData);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatContainerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let messageBody = {
        messaging_product: "whatsapp",
        to: formData.to,
        type: selectedTemplate ? "template" : "text",
      };

      if (selectedTemplate) {
        const selectedTemplateData = templates?.find(
          (template) => template.name === selectedTemplate
        );

        if (!selectedTemplateData) {
          console.error("Selected template not found in templates data.");
          alert("Error: Selected template not found.");
          return;
        }

        let components = [];
        const bodyComponent = selectedTemplateData.components?.find(
          (comp) => comp.type === "BODY"
        );

        if (bodyComponent) {
          const parameters = Object.entries(templateParams).map(
            ([key, value]) => ({
              type: "text",
              text: value,
            })
          );

          components.push({
            type: "body",
            parameters: parameters,
          });
        }

        messageBody = {
          ...messageBody,
          template: {
            name: selectedTemplate,
            language: {
              code: "en_US",
            },
            components: components,
          },
        };
      } else {
        messageBody = { ...messageBody, text: { body: formData.text.body } };
      }

      await sendMessage(messageBody).unwrap();
      refetch();
      alert("Message sent successfully!");
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Error sending message.");
    }
  };

  const getPhoneContainerStyle = () => {
    switch (platform) {
      case "android":
        return {
          background: "#f0f0f0",
          borderRadius: "20px",
          padding: "10px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          width: "320px",
        };
      case "apple":
        return {
          background: "#ffffff",
          borderRadius: "30px",
          padding: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          width: "320px",
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
      height: "500px",
    };
  };

  const renderTemplateDetails = () => {
    if (!selectedTemplate) return null;

    const template = templates?.find((t) => t.name === selectedTemplate);

    if (!template) return null;

    return (
      <div className="mt-4 p-4 bg-gray-100 rounded-md">
        <h3 className="text-lg font-semibold">Template Details:</h3>
        <p>Name: {template.name}</p>
        <p>Category: {template.category}</p>
        <p>Status: {template.status}</p>
        {template.components && (
          <div>
            <h4>Components:</h4>
            {template.components.map((component, index) => (
              <div key={index} className="border p-2 rounded-md mt-2">
                <p>Type: {component.type}</p>
                <p>Text: {component.text}</p>
                {component.format && <p>Format: {component.format}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen w-screen bg-gray-100 text-gray-800">
      <div className="w-1/2 p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            Message Configuration
          </h2>

          <div className="mb-4">
            <label className="mr-2 text-gray-700">Select Platform:</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="border border-gray-300 p-2 rounded text-gray-700 w-full"
            >
              <option value="android">Android</option>
              <option value="apple">Apple</option>
            </select>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <input
              type="text"
              name="to"
              placeholder="Recipient Number"
              value={formData.to}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded text-gray-700 w-full"
            />

            {!selectedTemplate && (
              <textarea
                name="body"
                placeholder="Type your message..."
                value={formData.text.body}
                onChange={handleChange}
                className="border border-gray-300 p-2 rounded text-gray-700 w-full"
              />
            )}

            <select
              value={selectedTemplate || ""}
              onChange={handleTemplateChange}
              className="border border-gray-300 p-2 rounded text-gray-700 w-full"
            >
              <option value="">Select a Template</option>
              {templates?.map((template) =>
                template.status === "APPROVED" ? (
                  <option key={template.name} value={template.name}>
                    {template.name}
                  </option>
                ) : null
              )}
            </select>

            {selectedTemplate &&
              Object.entries(templateParams).map(([paramName, value]) => (
                <input
                  key={paramName}
                  type="text"
                  name={paramName}
                  placeholder={`Enter ${paramName}`}
                  value={value}
                  onChange={handleParamChange}
                  className="border border-gray-300 p-2 rounded text-gray-700 w-full"
                />
              ))}

            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      </div>

      <div className="w-1/2 p-4">
        <div className="bg-white rounded-lg shadow-md p-4 h-full">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            WhatsApp Preview
          </h2>

          <div style={getPhoneContainerStyle()} className="mx-auto">
            <div style={getScreenStyle()}>
              <div className="bg-green-500 text-white p-4 flex items-center justify-between">
                <span>WhatsApp</span>
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/2044px-WhatsApp.svg.png"
                  alt="WhatsApp Logo"
                  className="w-8 h-8"
                />
              </div>

              <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
                {isMessagesLoading ? (
                  <p>Loading messages...</p>
                ) : messagesError ? (
                  <p>Error loading messages: {messagesError.message}</p>
                ) : Array.isArray(messages) ? (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`message ${
                        msg.direction === "sent" ? "sent" : "received"
                      }`}
                      style={{
                        backgroundColor:
                          msg.direction === "sent" ? "#DCF8C6" : "#FFFFFF",
                        borderRadius: "10px",
                        padding: "8px 12px",
                        marginBottom: "8px",
                        maxWidth: "70%",
                        marginLeft: msg.direction === "sent" ? "auto" : "0",
                        marginRight: msg.direction === "sent" ? "0" : "auto",
                        textAlign: msg.direction === "sent" ? "right" : "left",
                      }}
                    >
                      {msg.body ||
                        (msg.text && msg.text.body) ||
                        "No message content"}
                    </div>
                  ))
                ) : (
                  <p>No messages yet.</p>
                )}
                <div ref={chatContainerRef}></div>
                {renderTemplateDetails()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendMessageForm;
