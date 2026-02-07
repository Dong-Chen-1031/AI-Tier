import loader from "../assets/loader.svg";
import { memo } from "react";

const Loader = memo(function ({ size }: { size?: number }) {
  return (
    <div className="text-xl text-white">
      <img src={loader} width={size ?? 18} />
    </div>
  );
});

export default Loader;
