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

  // 로딩 중일 때 검은색 배경 표시
  if (isLoading && src) {
    return (
      <div
        className={`inline-block bg-black text-center align-middle ${className ?? ''}`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-full">
          <div className="animate-pulse bg-gray-800 w-full h-full"></div>
        </div>
      </div>
    )
  }

  // 에러 발생 시 검은색 배경에 기본 이미지 표시
  if (didError) {
    return (
      <div
        className={`inline-block bg-black text-center align-middle ${className ?? ''}`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-full">
          <div className="text-white text-sm">이미지 없음</div>
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
