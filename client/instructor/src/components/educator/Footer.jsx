

  import React from 'react'

const Footer = () => {
  return (
    <footer className='flex md:flex-row flex-col-reverse items-center justify-between text-left w-full px-8 border-t'>
      <div className='flex items-center gap-4'>
        <div className='hidden md:block h-7 w-px bg-gray-500/60'></div>
        <p className='py-4 text-center text-xs md:text-sm text-gray-500'>
          Copyright {new Date().getFullYear()} &copy; VidyaHub. All Rights Reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer

