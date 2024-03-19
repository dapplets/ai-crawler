import { Engine } from 'mutable-web-engine'
import React, { FC, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Draggable from 'react-draggable'
import styled from 'styled-components'
import {
  getPanelPinned,
  getPanelPosition,
  removePanelPinned,
  setPanelPinned,
  setPanelPosition,
} from '../storage'
import { Dropdown } from './components/dropdown'
const WrapperPanel = styled.div`
  width: 100vw;
  right: 0;
  position: fixed;
  z-index: 5000;
  top: 0;
  height: 15px;
  background: transparent;
  &::before {
    content: '';
    width: 100%;
    height: 5px;
    display: block;
    background: #384bff;
  }

  &:hover,
  &:focus {
    .visible-north-panel {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .visible-default {
    opacity: 1;
    transform: translateY(0);
  }
  .visible-pin {
    opacity: 1 !important;
    transform: translateY(0), translateX(50%);
  }
`
const NorthPanel = styled.div`
  position: relative;

  display: flex;
  align-items: center;
  justify-content: space-between;

  // margin: 0 auto;

  width: 284px;
  height: 45px;

  padding: 4px;

  border-radius: 0 0 6px 6px;
  background: #384bff;
  box-sizing: border-box;
  box-shadow: 0 4px 5px rgb(45 52 60 / 10%), 0 4px 20px rgb(11 87 111 / 15%);
  opacity: 0;
  transform: translateY(-100%);
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out, left 0.1s ease, right 0.1s ease;
`

const iconPinDefault = (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.1566 2.38999C10.9297 2.16289 10.6284 2.0253 10.3081 2.00252C9.98784 1.97974 9.6701 2.0733 9.41328 2.26599L7.47128 3.72266C6.66455 4.32785 5.71829 4.71992 4.71995 4.86266L3.26862 5.06933C2.78195 5.13933 2.42528 5.66333 2.65995 6.17733C2.88062 6.65933 3.58328 7.92999 5.56662 9.99066L2.78128 12.776C2.71761 12.8375 2.66682 12.9111 2.63188 12.9924C2.59694 13.0737 2.57855 13.1612 2.57778 13.2497C2.57701 13.3382 2.59388 13.426 2.6274 13.508C2.66092 13.5899 2.71043 13.6643 2.77302 13.7269C2.83562 13.7895 2.91005 13.839 2.99198 13.8725C3.07391 13.9061 3.1617 13.9229 3.25022 13.9222C3.33874 13.9214 3.42622 13.903 3.50755 13.8681C3.58889 13.8331 3.66245 13.7823 3.72395 13.7187L6.50928 10.9333C8.56995 12.9167 9.84062 13.6193 10.3226 13.84C10.836 14.0747 11.3606 13.718 11.43 13.2313L11.6373 11.78C11.78 10.7816 12.1721 9.83539 12.7773 9.02866L14.2333 7.08666C14.426 6.82984 14.5195 6.51211 14.4968 6.19184C14.474 5.87158 14.3364 5.57029 14.1093 5.34333L11.1566 2.38999ZM10.2133 3.33333L13.1666 6.28666L11.7106 8.22933C10.971 9.21531 10.4918 10.3718 10.3173 11.592L10.222 12.2593C9.56862 11.8433 8.48662 11.0347 6.97595 9.52399C5.46662 8.01333 4.65728 6.93199 4.24128 6.27866L4.90795 6.18333C6.12836 6.00897 7.28511 5.52976 8.27128 4.78999L10.2133 3.33333Z"
      fill="white"
    />
  </svg>
)
const iconPin = (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
    <g clipPath="url(#clip0_1327_10668)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.1566 2.38999C10.9297 2.16289 10.6284 2.0253 10.3081 2.00252C9.98784 1.97974 9.6701 2.0733 9.41328 2.26599L7.47128 3.72266C6.66455 4.32785 5.71829 4.71992 4.71995 4.86266L3.26862 5.06933C2.78195 5.13933 2.42528 5.66333 2.65995 6.17733C2.88062 6.65933 3.58328 7.92999 5.56662 9.99066L2.78128 12.776C2.71761 12.8375 2.66682 12.9111 2.63188 12.9924C2.59694 13.0737 2.57855 13.1612 2.57778 13.2497C2.57701 13.3382 2.59388 13.426 2.6274 13.508C2.66092 13.5899 2.71043 13.6643 2.77302 13.7269C2.83562 13.7895 2.91005 13.839 2.99198 13.8725C3.07391 13.9061 3.1617 13.9229 3.25022 13.9222C3.33874 13.9214 3.42622 13.903 3.50755 13.8681C3.58889 13.8331 3.66245 13.7823 3.72395 13.7187L6.50928 10.9333C8.56995 12.9167 9.84062 13.6193 10.3226 13.84C10.836 14.0747 11.3606 13.718 11.43 13.2313L11.6373 11.78C11.78 10.7816 12.1721 9.83539 12.7773 9.02866L14.2333 7.08666C14.426 6.82984 14.5195 6.51211 14.4968 6.19184C14.474 5.87158 14.3364 5.57029 14.1093 5.34333L11.1566 2.38999ZM10.2133 3.33333L13.1666 6.28666L11.7106 8.22933C10.971 9.21531 10.4918 10.3718 10.3173 11.592L10.222 12.2593C9.56862 11.8433 8.48662 11.0347 6.97595 9.52399C5.46662 8.01333 4.65728 6.93199 4.24128 6.27866L4.90795 6.18333C6.12836 6.00897 7.28511 5.52976 8.27128 4.78999L10.2133 3.33333Z"
        fill="white"
      />
      <path
        d="M8 11L3.5 6L5.5 5.5L7.5 4.5L9.5 3H10.5L13.5 5.5L13 7L11.5 9.5L10.5 13L8 11Z"
        fill="white"
      />
    </g>
    <defs>
      <clipPath id="clip0_1327_10668">
        <rect width="16" height="16" fill="white" transform="translate(0 0.5)" />
      </clipPath>
    </defs>
  </svg>
)

const PinWrapper = styled.div`
  width: 16px;
  height: 16px;
  cursor: pointer;

  &:hover,
  &:focus {
    opacity: 0.5;
  }
`
const DragWrapper = styled.div`
  width: 10px;
  height: 37px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  border-radius: 2px;
  &:hover,
  &:focus {
    opacity: 0.5;
  }
`

const DragIconWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 6px;
  height: 6px;
`

const iconDrag = (
  <svg xmlns="http://www.w3.org/2000/svg" width="6" height="1" viewBox="0 0 6 1" fill="none">
    <rect width="6" height="1" rx="0.5" fill="white" />
  </svg>
)
interface MultitablePanelProps {
  engine: Engine
}

export const MultitablePanel: FC<MultitablePanelProps> = (props) => {
  const [visible, setVisible] = useState(false)
  const [isPin, setPin] = useState(getPanelPinned() ? true : false)
  const [activeDrags, setActiveDrags] = useState(0)
  const [deltaPosition, setDeltaPosition] = useState(
    getPanelPosition() ? { x: parseInt(getPanelPosition()), y: 0 } : { x: 0, y: 0 }
  )
  const refNorthPanel = useRef<HTMLDivElement>(null)
  const [defaultPosition, setdefaultPosition] = useState(
    getPanelPosition() ? { x: parseInt(getPanelPosition()), y: 0 } : { x: 0, y: 0 }
  )

  const [bounds, setBounds] = useState({ left: 0, top: 0, right: 0, bottom: 0 })

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true)
    }, 5000)

    return () => clearTimeout(timer)
  }, [isPin, visible])

  const handleDrag = (e, ui) => {
    setVisible(false)
    setTimeout(() => {
      setVisible(true)
    }, 7000)

    setDeltaPosition({
      x: deltaPosition.x + ui.deltaX,
      y: deltaPosition.y + ui.deltaY,
    })

    setPanelPosition(deltaPosition.x.toString())
  }

  const onStart = () => {
    setActiveDrags(activeDrags + 1)
  }

  const onStop = () => {
    setActiveDrags(activeDrags - 1)
  }

  const dragHandlers = {
    onStart,
    onStop,

    defaultPosition,
  }
  const handlePin = () => {
    if (isPin) {
      removePanelPinned()
    } else {
      setPanelPinned('pin')
    }
    setPin(!isPin)
  }

  const updateBounds = () => {
    if (!refNorthPanel.current) return

    const rect = refNorthPanel.current.getBoundingClientRect()
    if (!rect) return

    setBounds({
      left: -((window.innerWidth - rect.width) / 2),
      top: 0,
      right: (window.innerWidth - rect.width) / 2,
      bottom: 0,
    })
  }

  useLayoutEffect(() => {
    updateBounds()
    window.addEventListener('resize', updateBounds)
    return () => window.removeEventListener('resize', updateBounds)
  }, [])

  return (
    <WrapperPanel>
      <div
        style={{
          position: 'relative',
          width: '99%',

          left: '0',
          display: 'flex',
          justifyContent: 'center',
          height: '1px',

          margin: '0 5px 0 5px',
        }}
        className="container"
      >
        <Draggable
          {...dragHandlers}
          onDrag={handleDrag}
          handle=".dragWrapper"
          axis="x"
          bounds={bounds}
        >
          <NorthPanel
            ref={(node) => {
              refNorthPanel.current = node
            }}
            id="northPanel"
            {...dragHandlers}
            className={isPin ? 'visible-pin' : visible ? 'visible-north-panel' : 'visible-default'}
          >
            <DragWrapper className="dragWrapper">
              <DragIconWrapper>
                {iconDrag}
                {iconDrag}
                {iconDrag}
              </DragIconWrapper>
            </DragWrapper>
            <Dropdown setVisible={setVisible} engine={props.engine} />
            <PinWrapper onClick={handlePin}>{isPin ? iconPin : iconPinDefault}</PinWrapper>
          </NorthPanel>
        </Draggable>
      </div>
    </WrapperPanel>
  )
}

export default MultitablePanel
