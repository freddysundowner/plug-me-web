
import {
  FaWhatsapp,
  FaFacebook,
  FaLinkedin,
  FaEnvelope,
} from "react-icons/fa";
const Socialicons = ({ provider }) => (
  <div className="flex justify-center mb-4">
    <a
      href={`https://wa.me/${provider.whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      className="mr-2"
    >
      <FaWhatsapp className="text-green-500 text-2xl" />
    </a>
    <a
      href={`https://www.facebook.com/${provider.facebook}`}
      target="_blank"
      rel="noopener noreferrer"
      className="mr-2"
    >
      <FaFacebook className="text-blue-500 text-2xl" />
    </a>
    <a
      href={`https://www.linkedin.com/in/${provider.linkedin}`}
      target="_blank"
      rel="noopener noreferrer"
      className="mr-2"
    >
      <FaLinkedin className="text-blue-700 text-2xl" />
    </a>
    <a href={`mailto:${provider.email}`} className="mr-2">
      <FaEnvelope className="text-gray-500 text-2xl" />
    </a>
  </div>
);
export default Socialicons;