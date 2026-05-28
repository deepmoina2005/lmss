import React, { useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { api, authHeaders } from '../../redux/service/api'
import { getAuthToken } from '../../redux/service/authToken'
import { toast } from 'react-toastify'

const Loading = () => {
  const { path } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      const sessionId = searchParams.get('session_id')
      const token = getAuthToken()

      if (sessionId && token) {
        try {
          await api.post('/api/user/confirm-purchase', { sessionId }, authHeaders(token))
        } catch (error) {
          toast.error(error.response?.data?.message || error.message)
        }
      }

      if (path) {
        const timer = setTimeout(() => {
          navigate(`/${path}`)
        }, 1500)

        return () => clearTimeout(timer)
      }
    }

    run()
  }, [path, navigate, searchParams])

  return (
    <div className='min-h-[10vh] flex items-center justify-center'>
      <div className="flex space-x-2">
        <div className="w-4 h-4 bg-blue-500 rounded-full animate-ping animation-delay-400"></div>
        <div className="w-4 h-4 bg-green-500 rounded-full animate-ping animation-delay-400"></div>
        <div className="w-4 h-4 bg-yellow-500 rounded-full animate-ping animation-delay-400"></div>
      </div>
    </div>
  )
}

export default Loading
