import React from "react";
import {
  FiUser,
  FiCalendar,
  FiMoreHorizontal,
  FiMessageCircle,
  FiFileText,
} from "react-icons/fi";
import { dateFormat } from "../../utils/dateFormat";
import { useAuth } from "../../context/AuthContext";

const TaskList = ({ tasks,callBack }) => {
  const { currentUser } = useAuth();
  return (
    <div className="mb-6">
      {tasks.map((task, index) => (
        <div
          key={index}
          className="flex justify-between items-center bg-white p-4 mb-2 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
        >

          <div className="flex flex-row items-center gap-2">
            <div className="relative">
              <FiFileText className="text-gray-400 text-2xl" />
              <span
                className={`absolute bottom-0 right-0 bg-${task.statusColor}-500 rounded-full h-3 w-3`}
              />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{task.service.value}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span
                  className={` ${task.status == 'completed' ? 'bg-green-100' : 'bg-yellow-100 '}  text-xs font-medium mr-2 px-2.5 py-0.5 rounded`}
                >
                  {task.status}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right relative group">
            <div>
              <p className="text-md font-bold text-gray-800 rounded-lg text-center border border-cyan-300">
                ${task.quote}
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Booked Day:  {dateFormat(task.date?.seconds * 1000)}
            </p>
            <div className="absolute z-50 top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-blue-900 text-white p-3 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center">
                <span className="bg-blue-500 rounded-full h-2 w-2 mr-2"></span>
                <p className="text-xs">
                  <span className="font-semibold">From:</span>{" "}
                  {task.slot.from}
                </p>
              </div>
              <div className="flex items-center mt-1">
                <span className="bg-white rounded-full h-2 w-2 mr-2"></span>
                <p className="text-xs">
                  <span className="font-semibold">To:</span>{" "}
                  {task?.slot?.to}
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-600 text-sm">{task.provider == currentUser?.uid ? "Client" : "Provider"}</p>
            <div className="flex items-center">
              <p className="text-gray-800 font-medium ml-2 text-sm">
                {task.provider == task.sender?.id ? task?.receiver?.username : task?.sender?.username}
              </p>
            </div>
          </div>
          <button
            className={`border border-${task.statusColor}-500 text-${task.statusColor}-700 px-3 py-1 rounded-full shadow-sm hover:bg-${task.statusColor}-200 transition-colors duration-200 flex items-center`}
          >
            <span
              className={`bg-${task.statusColor}-500 rounded-full h-2 w-2 mr-2`}
            ></span>
            {task.status}
          </button>
          <FiMessageCircle
            className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors duration-200"
            size={25}
            color="red"
            onClick={() => {
              callBack(task)
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default TaskList;
