import React from 'react';
import { Card, CardBody, Typography } from "@material-tailwind/react";

/**
 * StatisticsCard - A reusable card component for displaying statistics
 * 
 * @param {string} title - The title of the statistic
 * @param {string} value - The value to display
 * @param {React.ReactNode} icon - Icon component to display
 * @param {string} color - The color theme (blue, purple, green, amber, etc.)
 * @param {boolean} loading - Whether the card is in a loading state
 * @param {string} footer - Optional footer text
 */
const StatisticsCard = ({ title, value, icon, color = "blue", loading = false, footer }) => {
  // Color mapping for different themes
  const colorMapping = {
    blue: {
      iconBg: "bg-blue-100",
      iconText: "text-blue-600",
      titleText: "text-blue-600"
    },
    purple: {
      iconBg: "bg-purple-100",
      iconText: "text-purple-600",
      titleText: "text-purple-600"
    },
    green: {
      iconBg: "bg-green-100",
      iconText: "text-green-600",
      titleText: "text-green-600"
    },
    amber: {
      iconBg: "bg-amber-100",
      iconText: "text-amber-600",
      titleText: "text-amber-600"
    },
    red: {
      iconBg: "bg-red-100",
      iconText: "text-red-600",
      titleText: "text-red-600"
    },
    indigo: {
      iconBg: "bg-indigo-100",
      iconText: "text-indigo-600",
      titleText: "text-indigo-600"
    }
  };

  // Use default color if the provided color isn't in the mapping
  const theme = colorMapping[color] || colorMapping.blue;

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow">
      <CardBody className="p-4">
        <div className="flex justify-between">
          <div>
            <Typography variant="small" className="font-medium text-gray-500">
              {title}
            </Typography>
            {loading ? (
              <div className="mt-2 animate-pulse h-8 w-16 bg-gray-200 rounded-md"></div>
            ) : (
              <Typography variant="h4" className="font-bold mt-1">
                {value}
              </Typography>
            )}
            {footer && (
              <Typography variant="small" className="text-gray-500 mt-2">
                {footer}
              </Typography>
            )}
          </div>
          
          <div className={`${theme.iconBg} h-12 w-12 rounded-full flex items-center justify-center`}>
            {React.cloneElement(icon, {
              className: `${theme.iconText} h-6 w-6`
            })}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default StatisticsCard;
