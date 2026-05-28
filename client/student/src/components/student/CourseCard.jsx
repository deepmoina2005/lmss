import React from 'react'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { calculateRating } from '../../redux/service/courseUtils'

const CourseCard = ({course}) => {
  const currency = useSelector((state) => state.course.currency)

  return (
    <Link to={'/course/' + course._id} onClick={()=>scrollTo(0,0)} 
    className='border border-gray-500/30 pb-6 overflow-hidden rounded-lg'>
      <img className='w-full' src={course.courseThumbnail} alt="courseThumbnail" />
      <div className='p-3 text-left'>
        <h3 className='text-base font-semibold'>{course.courseTitle}</h3>
        
        <div className='flex items-center space-x-2'>
          <p>{calculateRating(course)}</p>
          <div className='flex'>
            {[...Array(5)].map((_,i)=>(
              <img className='w-3.5 h-3.5' key={i} src={i<Math.floor(calculateRating(course)) ? assets.star : assets.star_blank} alt='star' />
            ))}
          </div>
          <p className='text-gray-500'>{course.courseRatings.length}</p>
        </div>
        <p className='text-base font-semibold text-gray-800'>{currency} {(course.coursePrice - course.discount * course.coursePrice / 100).toFixed(2)}</p>
      </div>
    </Link>
  )
}

export default CourseCard
