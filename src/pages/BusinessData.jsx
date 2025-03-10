import React from "react";
import { useDispatch } from "react-redux";

const BusinessData = ({ data }) => {
  if (!data) {
    return <p>No business data available.</p>;
  }

  return (
    <div>
      <h2>Business Data</h2>
      <p>
        <strong>ID:</strong> {data.id}
      </p>
      <p>
        <strong>Name:</strong> {data.name}
      </p>
      <p>
        <strong>Currency:</strong> {data.currency}
      </p>
      <p>
        <strong>Timezone ID:</strong> {data.timezone_id}
      </p>
      <p>
        <strong>Message Template Namespace:</strong>{" "}
        {data.message_template_namespace}
      </p>
    </div>
  );
};

export default BusinessData;
