import { ElementRef, useRef, useState } from 'react'
import { motion, animate, useMotionValue, useTransform, useMotionValueEvent  } from 'framer-motion'
import * as RadixSlider from "@radix-ui/react-slider"
import { SpeakerLoudIcon, SpeakerOffIcon } from '@radix-ui/react-icons'

const decay = (value: number, max: number) => {
  if (max === 0) {
    return 0
  }

  const entry = value / max
  const sigmoid = 2 * (1 / (1 + Math.exp(-entry)) - 0.5)

  return sigmoid * max
}


const Slider = () => {
  const MAX_OVERFLOW = 50
  const ref = useRef<ElementRef<typeof RadixSlider.Root>>(null)
  const [volume, setVolume] = useState<number>(50)
  const [region, setRegion] = useState<string>('middle')
  const scale = useMotionValue<number>(1)
  const overflow = useMotionValue<number>(0)
  const clientX = useMotionValue<number>(0)

  useMotionValueEvent(clientX, 'change', (latest) => {
    if (ref.current) {
      const { left, right } = ref.current.getBoundingClientRect()
      let newValue

      if (latest < left){
        setRegion('left')
        newValue = left - latest
      } else if (latest > right) {
        setRegion('right')
        newValue = latest - right
      } else {
        setRegion('middle')
        newValue = 0
      }

      overflow.jump(decay(newValue, MAX_OVERFLOW))
    }
  })

  return (
    <motion.div
      onHoverStart={() => animate(scale, 1.2)}
      onHoverEnd={() => animate(scale, 1)}
      onTouchStart={() => animate(scale, 1.2)}
      onTouchEnd={() => animate(scale, 1)}
      style={{
        scale,
        opacity: useTransform(scale, [1, 1.2], [0.7, 1]) // scale이 1일 때, opacity는 0.7, scale이 1.2일 때, opacity는 1로 변환
      }}
      className="flex w-full touch-none select-none items-center justify-center gap-3"
    >
      <motion.div
        animate={{
          scale: region === 'left' ? [1, 1.4, 1] : 1, // scale이 1 -> 1.4 -> 1 로 돌아오는 애니메이션을 실행
          transition: { duration: 0.25 }
        }}
        style={{
          x: useTransform(() => region === 'left' ? -overflow.get() / scale.get() : 0)
        }}
      >
        <SpeakerLoudIcon color="#FCFCFC" className="size-5 translate-x-0 translate-y-0" />
      </motion.div>

      <RadixSlider.Root
        ref={ref}
        value={[volume]}
        onValueChange={([v]) => setVolume(Math.floor(v))}
        step={0.01}
        className="relative flex w-full max-w-[200px] grow cursor-grab touch-none select-none items-center py-4 active:cursor-grabbing"
        onPointerMove={(event) => {
          if (event.button > 0) {
            clientX.jump(event.clientX)
          }
        }}
        onLostPointerCapture={() => animate(overflow, 0, { type: 'spring', bounce: 0.5 })}
      >
        <motion.div
          style={{
            scaleX: useTransform(() => {
              if (ref.current) {
                const { width } = ref.current.getBoundingClientRect()
                return 1 + overflow.get() / width
              }
            }),
            scaleY: useTransform(overflow, [0, MAX_OVERFLOW], [1, 0.8]),
            transformOrigin: useTransform(() => {
              if (ref.current) {
                const { left, width } = ref.current.getBoundingClientRect()
                return clientX.get() < left + width / 2 ? 'right': 'left'
              }
            }),
            height: useTransform(scale, [1, 1.2], [6, 12]),
            marginTop: useTransform(scale, [1, 1.2], [0, -3]),
            marginBottom: useTransform(scale, [1, 1.2], [0, -3])
          }}
          className="flex grow"
        >
          <RadixSlider.Track className="relative isolate h-full grow overflow-hidden rounded-full bg-gray-500 ">
            <RadixSlider.Range className="absolute h-full bg-white" />
          </RadixSlider.Track>
        </motion.div>

      </RadixSlider.Root>

      <motion.div
        animate={{
          scale: region === 'right' ? [1, 1.4, 1] : 1,
          transition: { duration: 0.25 }
        }}
        style={{
          x: useTransform(() => region === 'right' ? overflow.get() / scale.get() : 0)
        }}
      >
        <SpeakerOffIcon color="#FCFCFC" className="size-5 translate-x-0 translate-y-0" />
      </motion.div>
    </motion.div>
  )
}

export default Slider
