import { useState } from 'react';
import { ArrowRight, ArrowUpRight, Settings2, ShieldCheck } from 'lucide-react';
import { Modal } from '../components/Modal.jsx';

export function EngineModal({ onClose, onNotify }) {
  const [tab, setTab] = useState('video');
  return (
    <Modal title="Connect your creative engines" kicker="STUDIO SETTINGS" onClose={onClose} wide>
      <div className="engine-modal-intro">
        <div className="engine-hero-icon">
          <Settings2 size={19} />
        </div>
        <p>
          Fable keeps your workflow separate from the providers that power it. Connect keys on a
          secure server before creating live generations.
        </p>
      </div>
      <div className="engine-tabs">
        {[
          ['video', 'Video generation'],
          ['voice', 'Voice & audio'],
          ['storage', 'Storage & render'],
        ].map(([key, label]) => (
          <button key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>
      <div className="engine-list">
        {(tab === 'video'
          ? [
              {
                initial: 'R',
                name: 'Runway',
                sub: 'Reference-led video generation',
                note: 'Character and location references',
                env: 'RUNWAY_API_KEY',
                color: 'engine-runway',
              },
              {
                initial: 'V',
                name: 'Google Veo',
                sub: 'Cinematic text and image-to-video',
                note: 'Video and generated audio options',
                env: 'GOOGLE_AI_API_KEY',
                color: 'engine-veo',
              },
            ]
          : tab === 'voice'
            ? [
                {
                  initial: 'VO',
                  name: 'Voice engine',
                  sub: 'Licensed narration & dialogue',
                  note: 'Use approved voices; no unauthorized voice cloning',
                  env: 'VOICE_PROVIDER_API_KEY',
                  color: 'engine-voice',
                },
              ]
            : [
                {
                  initial: 'S3',
                  name: 'Object storage',
                  sub: 'Private source and render assets',
                  note: 'S3-compatible storage or Azure Blob',
                  env: 'STORAGE_BUCKET',
                  color: 'engine-storage',
                },
                {
                  initial: 'FX',
                  name: 'Render worker',
                  sub: 'Stitch scenes and export MP4',
                  note: 'FFmpeg worker with a job queue',
                  env: 'FFMPEG_PATH',
                  color: 'engine-render',
                },
              ]
        ).map((engine) => (
          <div className="engine-card" key={engine.name}>
            <div className={`engine-logo ${engine.color}`}>{engine.initial}</div>
            <div className="engine-copy">
              <strong>
                {engine.name}{' '}
                <span className="engine-status">
                  <i /> Not connected
                </span>
              </strong>
              <span>{engine.sub}</span>
              <small>{engine.note}</small>
            </div>
            <button
              className="button button-outline button-small"
              onClick={() =>
                onNotify(
                  `${engine.env} belongs in your server environment—never in browser storage.`,
                )
              }
            >
              Setup guide <ArrowUpRight size={13} />
            </button>
          </div>
        ))}
      </div>
      <div className="engine-security">
        <ShieldCheck size={17} />
        <div>
          <strong>Keep API keys off the client.</strong>
          <span>
            Use server-side environment variables and short-lived upload URLs. The preview is
            running without provider credentials.
          </span>
        </div>
      </div>
      <div className="engine-modal-footer">
        <span>Provider orchestration · consent checks · moderation · render queue</span>
        <button
          className="button button-primary"
          onClick={() =>
            onNotify(
              'See “Suggested production architecture” in README.md. Add credentials only on a secured backend.',
            )
          }
        >
          View integration checklist <ArrowRight size={15} />
        </button>
      </div>
    </Modal>
  );
}
