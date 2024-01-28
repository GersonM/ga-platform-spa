import React, {useContext, useEffect, useRef, useState} from 'react';
import ReactPlayer from 'react-player';
import {Button, Popover} from 'antd';

import {File} from '../../Types/api';
import AuthContext from '../../Context/AuthContext';

import './styles.less';
import FileActivityForm from '../FileActivityForm';
import Hotkey from '../Hotkey';

interface VideoPlayerProps {
  video: File;
  startTime?: number;
  onActivityChange?: () => void;
}

const MediaPlayer = ({video, startTime, onActivityChange}: VideoPlayerProps) => {
  const [playing, setPlaying] = useState(true);
  const [time, setTime] = useState(0);
  const [muted, setMuted] = useState(false);
  const ref = useRef<ReactPlayer>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [videoRate, setVideoRate] = useState(1);
  const [openAddActivity, setOpenAddActivity] = useState(false);
  const {user} = useContext(AuthContext);

  useEffect(() => {
    if (startTime && ref.current) {
      ref.current.seekTo(startTime);
    }
  }, [startTime]);

  useEffect(() => {
    if (ref.current && video.start_from && playerReady) {
      ref.current.seekTo(video.start_from);
    }
  }, [ref, video, playerReady]);

  useEffect(() => {
    const keyDownHandler = (event: KeyboardEvent) => {
      if (!event.ctrlKey) {
        return;
      }

      if (event.code === 'ArrowLeft') {
        event.preventDefault();
        setVideoRate(state => state - 0.3);
      }
      if (event.code === 'ArrowRight') {
        event.preventDefault();
        setVideoRate(state => state + 0.3);
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
          url={video.source}
          progressInterval={300}
          onProgress={state => {
            setTime(Math.round(state.playedSeconds));
          }}
        />
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
                    file={video}
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

//wget --load-cookies /tmp/cookies.txt "https://docs.google.com/uc?export=download&confirm=$(wget --quiet --save-cookies /tmp/cookies.txt --keep-session-cookies --no-check-certificate 'https://docs.google.com/uc?export=download&id=16gJZiIm3kEfIhjcx2sNoj2Q_2YG2BoWP' -O- | sed -rn 's/.*confirm=([0-9A-Za-z_]+).*/\1\n/p')&id=16gJZiIm3kEfIhjcx2sNoj2Q_2YG2BoWP" -O andina.wpress && rm -rf /tmp/cookies.txt

export default MediaPlayer;
