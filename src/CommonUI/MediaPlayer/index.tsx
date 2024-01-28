import React, {useContext, useEffect, useRef, useState} from 'react';
import ReactWaves, {ReactWavesProps} from '@dschoon/react-waves';
import ReactPlayer from 'react-player';
import {Button, Popover} from 'antd';

import {File} from '../../Types/api';
import AuthContext from '../../Context/AuthContext';

import './styles.less';
import FileActivityForm from '../FileActivityForm';
import Hotkey from '../Hotkey';

import sound from '../../Assets/2gs6xzw9FuiYYAAieJlYlWA3lMtp0RqZ3xfJUJFJ.mp3';

interface VideoPlayerProps {
  media: File;
  startTime?: number;
  onActivityChange?: () => void;
}

const MediaPlayer = ({media, startTime, onActivityChange}: VideoPlayerProps) => {
  const [playing, setPlaying] = useState(true);
  const [time, setTime] = useState(0);
  const [muted, setMuted] = useState(false);
  const ref = useRef<ReactPlayer>(null);
  const audioRef = useRef<ReactWavesProps>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [videoRate, setVideoRate] = useState(1);
  const [openAddActivity, setOpenAddActivity] = useState(false);
  const {user} = useContext(AuthContext);

  useEffect(() => {
    if (startTime) {
      if (ref.current) {
        ref.current.seekTo(startTime);
      }
      setTime(startTime);
      console.log('time ----', {startTime});
    }
  }, [startTime]);

  useEffect(() => {
    if (ref.current && media.start_from && playerReady) {
      ref.current.seekTo(media.start_from);
    }
  }, [ref, media, playerReady]);

  useEffect(() => {
    const keyDownHandler = (event: KeyboardEvent) => {
      if (event.code === 'ArrowLeft') {
        event.preventDefault();
        setVideoRate(state => state - 0.3);
      }
      if (event.code === 'ArrowRight') {
        event.preventDefault();
        setVideoRate(state => state + 0.3);
      }
      if (!event.ctrlKey) {
        return;
      }

      if (event.code === 'KeyP') {
        event.preventDefault();
        handlePlay();
      }

      if (event.code === 'KeyM') {
        event.preventDefault();
        setMuted(state => !state);
      }
      if (event.code === 'KeyN') {
        event.preventDefault();
        setOpenAddActivity(state => {
          setPlaying(state);
          return !state;
        });
      }
    };

    document.addEventListener('keydown', keyDownHandler);

    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    };
  }, []);

  const handlePlay = () => {
    setPlaying(state => !state);
  };

  const toggleActivity = () => {
    setOpenAddActivity(!openAddActivity);
    setPlaying(openAddActivity);
  };

  return (
    <>
      <div className={'video-player-wrapper'}>
        {media.type.includes('vid') && (
          <ReactPlayer
            ref={ref}
            playbackRate={videoRate}
            onReady={() => setPlayerReady(true)}
            autoplay
            width={'100%'}
            height={'auto'}
            controls={true}
            muted={muted}
            playing={playing}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            url={media.source}
            progressInterval={300}
            onProgress={state => {
              setTime(Math.round(state.playedSeconds));
            }}
          />
        )}
        {media.type.includes('aud') && (
          <>
            <ReactWaves
              audioFile={sound}
              className={'react-waves'}
              pos={1}
              options={{
                barHeight: 1,
                cursorWidth: 0,
                height: 120,
                progressColor: '#EC407A',
                responsive: true,
                waveColor: '#D1D6DA',
                mediaControls: true,
                cursorColor: '#0000ff',
                normalize: true,
                barRadius: 12,
                audioRate: videoRate,
              }}
              volume={muted ? 0 : 1}
              zoom={2}
              // @ts-ignore
              onPosChange={(pos: any) => {
                //setTime(pos);
              }}
              playing={playing}
            />
          </>
        )}
      </div>
      <div>
        <div className={'shortcuts-container'}>
          <Hotkey shortKey={'P'} title={'Reproducir / Pausar'} />
          <Hotkey shortKey={'M'} title={'Silenciar'} />
          <Hotkey shortKey={'N'} title={'Agregar nota'} />
          <Hotkey shortKey={'←'} title={'Reducir velocidad'} />
          <Hotkey shortKey={'→'} title={'Incrementar velocidad'} />
          {user && (
            <>
              <Popover
                title={'Agregar comentario'}
                trigger={['click']}
                open={openAddActivity}
                content={
                  <FileActivityForm
                    onCompleted={() => {
                      toggleActivity();
                      if (onActivityChange) {
                        onActivityChange();
                      }
                    }}
                    file={media}
                    type={'comment'}
                    time={time}
                  />
                }>
                <Button ghost type={'primary'} shape={'round'} onClick={toggleActivity}>
                  Agregar nota en el segundo {time}
                </Button>
              </Popover>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MediaPlayer;
