import React from "react";
import { Fade } from "react-awesome-reveal"; // Using react-awesome-reveal for animations


const NutritionBlog = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        <Fade triggerOnce>
          <h1 className="text-4xl font-bold text-center mb-8 text-green-800">
            Nutrition Blog
          </h1>
        </Fade>
        <Fade delay={300} triggerOnce>
          <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-2 text-indigo-700">
              Healthy Diet Tips
            </h2>
            <p className="text-gray-700">
              Discover the benefits of a balanced diet that includes proteins, carbs, fats, and essential vitamins. Learn how to plan your meals for sustained energy and overall well-being.
            </p>
            <img 
              src="https://www.eatingwell.com/thmb/m5xUzIOmhWSoXZnY-oZcO9SdArQ=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/article_291139_the-top-10-healthiest-foods-for-kids_-02-4b745e57928c4786a61b47d8ba920058.jpg" 
              alt="Healthy Food" 
              className="w-full mt-4 rounded"
            />
          </div>
        </Fade>
        <Fade delay={600} triggerOnce>
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-2 text-indigo-700">
              Sample Diet Plan
            </h2>
            <p className="text-gray-700">
              Here is an example of a diet plan for boosting metabolism and maintaining a healthy lifestyle. Breakfast: Oatmeal with fresh fruits. Lunch: Grilled chicken with salad. Dinner: Steamed vegetables with brown rice.
            </p>
            <img 
              src="https://marketplace.canva.com/EADao7rYzhU/1/0/1236w/canva-pastel-pink-and-yellow-cute-meal-planner-menu-P0tKy_kE9tY.jpg" 
              alt="Diet Plan" 
              className="w-full mt-4 rounded"
            />
          </div>
        </Fade>
      </div>
    </div>
  );
};

export default NutritionBlog;
