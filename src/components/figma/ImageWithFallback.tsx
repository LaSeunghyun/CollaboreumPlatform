import React, { useState } from 'react'

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleError = () => {
    setDidError(true)
    setIsLoading(false)
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  const { src, alt, style, className, ...rest } = props

  // 로딩 중일 때 그라데이션 배경 표시
  if (isLoading && src) {
    return (
      <div
        className={`inline-block bg-gradient-to-br from-gray-200 to-gray-300 text-center align-middle ${className ?? ''}`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-full">
          <div className="animate-pulse bg-gray-400 w-full h-full"></div>
        </div>
      </div>
    )
  }

  // 에러 발생 시 기본 아바타 이미지 표시
  if (didError) {
    return (
      <div
        className={`inline-block bg-gradient-to-br from-blue-500 to-purple-600 text-center align-middle ${className ?? ''}`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-full">
          <div className="text-white text-2xl font-bold">
            {alt ? alt.charAt(0).toUpperCase() : '?'}
          </div>
        </div>
      </div>
    )
  }

  // 정상적인 이미지 표시
  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      style={style} 
      {...rest} 
      onError={handleError}
      onLoad={handleLoad}
    />
  )
}
