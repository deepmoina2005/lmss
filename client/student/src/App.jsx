import { Route, Routes, useMatch } from 'react-router-dom'
import Home from './pages/student/Home'
import CoursesList from './pages/student/CoursesList'
import CourseDetails from './pages/student/CourseDetails'
import MyEnrollMents from './pages/student/MyEnrollMents'
import Player from './pages/student/Player'
import Loading from './components/student/Loading'
import Navbar from './components/student/Navbar'
import "quill/dist/quill.snow.css";
import { ToastContainer } from 'react-toastify';
import About from './components/About'
import ContactForm from './components/ContactForm'
import PrivacyPolicy from './components/PrivacyPolicy'
import StudentLogin from './pages/auth/StudentLogin'
import StudentRegister from './pages/auth/StudentRegister'
import Profile from './pages/student/Profile'

const App = () => {
  const isEducatorRoute = useMatch('/educator/*')

  return (
    <div className='text-default min-h-screen bg-white'>
      <ToastContainer />
      {!isEducatorRoute && <Navbar/> }
      
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/course-list' element={<CoursesList/>} />
        <Route path='/course-list/:input' element={<CoursesList/>} />
        <Route path='/course/:id' element={<CourseDetails/>} />
        <Route path='/my-enrollments' element={<MyEnrollMents/>} />
        <Route path='/profile' element={<Profile/>} />
        <Route path='/player/:courseId' element={<Player/>} />
        <Route path='/loading/:path' element={<Loading/>} />

        <Route path='/about' element={<About/>} />
        <Route path='/contact' element={<ContactForm/>} />
        <Route path='/privacy-policy' element={<PrivacyPolicy/>} />

        <Route path='/auth/student/login' element={<StudentLogin/>} />
        <Route path='/auth/student/register' element={<StudentRegister/>} />
      </Routes>
    </div>
  )
}

export default App
