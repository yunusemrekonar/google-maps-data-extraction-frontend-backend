import React from "react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const FormInput: React.FC<FormInputProps> = ({ label, ...props }) => {
  return (
    <div className="mb-4">
      <label htmlFor={props.name} className="block text-sm font-medium">
        {label}
      </label>
      <input
        {...props}
        className="mt-1 block w-96 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
      />
    </div>
  );
};

export default FormInput;
