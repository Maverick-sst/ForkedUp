import { FaHome,FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
function BottomNav() {
  return (
    <>
      {/* Sticky bottom navigation bar */}
      <div className="absolute inset-x-0 bottom-0 max-w-[450px] mx-auto px-8 py-2 flex justify-between items-center bg-black/30 backdrop-blur-md z-20">
        <Link to={"/"} onClick={(e) => e.stopPropagation()}>
          <FaHome size={25} className="text-white" />
        </Link>
        <Link to={"/profile"} onClick={(e) => e.stopPropagation()}>
          <FaUser size={25} className="text-white" />
        </Link>
      </div>
    </>
  );
}

export default BottomNav;
