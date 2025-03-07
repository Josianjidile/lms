import React from 'react';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const Loading = () => {

  const {path} =useParams()
  const navigate= useNavigate()


  useEffect(()=>{
    if(path){
      const timer = setTimeout(()=>{
        navigate(`/${path}`)
      },5000)
      return ()=> clearTimeout(timer);
    }
  },[])
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      <p className="ml-4 text-gray-700">Loading...</p>
    </div>
  );
};

export default Loading;