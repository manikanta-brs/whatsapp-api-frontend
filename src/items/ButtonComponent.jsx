// import React from "react";
// import styled from "styled-components";

// const Button = ({ children, onClick, isSelected }) => {
//   return (
//     <StyledButton onClick={onClick} isSelected={isSelected}>
//       {children}
//     </StyledButton>
//   );
// };

// const StyledButton = styled.button`
//   font-family: inherit;
//   padding: 10px 18px;
//   margin: 5px;
//   border: 2px solid ${(props) => (props.isSelected ? "#007bff" : "#560bad")};
//   border-radius: 8px;
//   font-size: 16px;
//   font-weight: 600;
//   cursor: pointer;
//   transition: all 0.3s ease-in-out;
//   color: ${(props) => (props.isSelected ? "#fff" : "#560bad")};
//   background: ${(props) => (props.isSelected ? "#007bff" : "transparent")};
//   box-shadow: ${(props) =>
//     props.isSelected ? "0px 3px 6px rgba(0, 123, 255, 0.4)" : "none"};

//   &:hover {
//     background: #560bad;
//     color: #fff;
//     transform: scale(1.05);
//     box-shadow: 0px 4px 10px rgba(86, 11, 173, 0.5);
//   }

//   &:active {
//     background: #3a0ca3;
//     transform: scale(0.95);
//   }
// `;

// export default Button;

import React from "react";
import styled from "styled-components";

const Button = ({ children, onClick, isSelected }) => {
  return (
    <StyledButton onClick={onClick} $isSelected={isSelected}>
      {children}
    </StyledButton>
  );
};

const StyledButton = styled.button`
  font-family: inherit;
  padding: 10px 18px;
  margin: 5px;
  border: 2px solid ${(props) => (props.$isSelected ? "#007bff" : "#560bad")};
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  color: ${(props) => (props.$isSelected ? "#fff" : "#560bad")};
  background: ${(props) => (props.$isSelected ? "#007bff" : "transparent")};
  box-shadow: ${(props) =>
    props.$isSelected ? "0px 3px 6px rgba(0, 123, 255, 0.4)" : "none"};

  &:hover {
    background: #560bad;
    color: #fff;
    transform: scale(1.05);
    box-shadow: 0px 4px 10px rgba(86, 11, 173, 0.5);
  }

  &:active {
    background: #3a0ca3;
    transform: scale(0.95);
  }
`;

export default Button;
