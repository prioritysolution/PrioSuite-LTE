import { FC, ReactNode } from "react";
import { Toaster } from "react-hot-toast";

interface ToasterProviderProps {
  children: ReactNode; // Typing the children prop
}

const ToasterProvider: FC<ToasterProviderProps> = ({ children }) => {
  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />
      {children}
    </>
  );
};

export default ToasterProvider;
