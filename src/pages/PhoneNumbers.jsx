import React from "react";
import { useGetPhoneNumbersQuery } from "../store/adminApiSlice";

const PhoneNumbers = () => {
  const { data: phoneNumbers, error, isLoading } = useGetPhoneNumbersQuery();
  // console.log(phoneNumbers?.data);
  return (
    <div>
      <div>
        {phoneNumbers &&
          phoneNumbers?.data.map((phoneNumber) => (
            <div key={phoneNumber.id}>
              <p>Phone Number: {phoneNumber.display_phone_number}</p>
              <p>Status: {phoneNumber.code_verification_status}</p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default PhoneNumbers;
