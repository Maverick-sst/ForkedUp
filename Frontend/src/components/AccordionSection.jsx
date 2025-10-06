import { FaChevronDown} from 'react-icons/fa';

const AccordionSection = ({ title, icon: Icon, children, isOpen, onClick }) => {
  return (
    <div className="border-b border-brand-gray-light">
      <button
        type="button"
        className="w-full flex justify-between items-center py-4 text-left font-heading text-brand-gray"
        onClick={onClick}
      >
        <div className="flex items-center">
          <Icon className="mr-3 text-brand-orange" />
          <span>{title}</span>
        </div>
        <FaChevronDown className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="pb-4 px-2 space-y-4 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};
export default AccordionSection;