import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import {
  AtSign,
  CalendarDays,
  Camera,
  CheckCircle2,
  Image,
  Link,
  Megaphone,
  MessageSquareText,
  RefreshCw,
  Send,
  Share2,
} from 'lucide-react'
import {
  initialSocialDraft,
  socialContentPillars,
  socialPostTypes,
  type MetaStatus,
  type SocialChannel,
  type SocialPostHistoryItem,
  type SocialPostType,
  type XStatus,
} from './dashboard-model'
import { EmptyState, SectionHeading } from './SharedUi'

export function SocialMediaMarketing({
  draft,
  history,
  message,
  onChange,
  onSubmit,
  posting,
}: {
  draft: typeof initialSocialDraft
  history: SocialPostHistoryItem[]
  message: string
  onChange: (draft: typeof initialSocialDraft) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  posting: boolean
}) {
  const [config, setConfig] = useState<MetaStatus | null>(null)
  const [xConfig, setXConfig] = useState<XStatus | null>(null)
  const [localImageName, setLocalImageName] = useState('')

  async function loadMetaStatus() {
    const response = await fetch('/api/meta/auth/status')
    const result = (await response.json()) as MetaStatus
    setConfig(result)
  }

  async function loadXStatus() {
    const response = await fetch('/api/x/auth/status')
    const result = (await response.json()) as XStatus
    setXConfig(result)
  }

  useEffect(() => {
    let cancelled = false

    void fetch('/api/meta/auth/status')
      .then((response) => response.json())
      .then((result: MetaStatus) => {
        if (!cancelled) setConfig(result)
      })
      .catch(() => {
        if (!cancelled) setConfig(null)
      })

    void fetch('/api/x/auth/status')
      .then((response) => response.json())
      .then((result: XStatus) => {
        if (!cancelled) setXConfig(result)
      })
      .catch(() => {
        if (!cancelled) setXConfig(null)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const selectedChannels = new Set(draft.channels)
  const localImageSatisfiesFacebook =
    selectedChannels.has('facebook') && localImageName.length > 0
  const mediaUrlRequired =
    selectedChannels.has('instagram') ||
    draft.postType === 'video' ||
    draft.postType === 'reel'
  const needsMedia =
    draft.postType === 'photo' ||
    draft.postType === 'video' ||
    draft.postType === 'reel'
  const missingRequiredMedia =
    (needsMedia || mediaUrlRequired) &&
    !draft.mediaUrl.trim() &&
    !localImageSatisfiesFacebook

  function toggleChannel(channel: SocialChannel) {
    const channels = selectedChannels.has(channel)
      ? draft.channels.filter((item) => item !== channel)
      : [...draft.channels, channel]

    onChange({ ...draft, channels })
  }

  async function selectConnectedPage(pageId: string) {
    await fetch('/api/meta/pages/select', {
      body: JSON.stringify({ pageId }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    await loadMetaStatus()
  }

  return (
    <section className="social-layout">
      <article className="surface social-composer">
        <SectionHeading
          icon={<Megaphone />}
          title="Social Media Marketing"
          value={config?.version ?? 'Graph API'}
        />

        {message && <p className="status-banner">{message}</p>}

        <form className="entry-form" onSubmit={onSubmit}>
          <div className="channel-row">
            <label className="channel-toggle">
              <input
                checked={selectedChannels.has('facebook')}
                onChange={() => toggleChannel('facebook')}
                type="checkbox"
              />
              <Share2 />
              Facebook Page
            </label>
            <label className="channel-toggle">
              <input
                checked={selectedChannels.has('instagram')}
                onChange={() => toggleChannel('instagram')}
                type="checkbox"
              />
              <Camera />
              Instagram
            </label>
            <label className="channel-toggle">
              <input
                checked={selectedChannels.has('x')}
                onChange={() => toggleChannel('x')}
                type="checkbox"
              />
              <AtSign />
              X
            </label>
          </div>

          <div className="field-grid">
            <label>
              Post type
              <select
                onChange={(event) =>
                  onChange({
                    ...draft,
                    postType: event.target.value as SocialPostType,
                  })
                }
                value={draft.postType}
              >
                {socialPostTypes.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Campaign
              <input
                onChange={(event) =>
                  onChange({ ...draft, campaign: event.target.value })
                }
                value={draft.campaign}
              />
            </label>
          </div>

          <label>
            Post copy
            <textarea
              onChange={(event) =>
                onChange({ ...draft, caption: event.target.value })
              }
              rows={8}
              value={draft.caption}
            />
          </label>

          <div className="field-grid">
            <label>
              Link URL
              <input
                onChange={(event) =>
                  onChange({ ...draft, linkUrl: event.target.value })
                }
                type="url"
                value={draft.linkUrl}
              />
            </label>
            <label>
              Public media URL
              <input
                onChange={(event) =>
                  onChange({ ...draft, mediaUrl: event.target.value })
                }
                required={mediaUrlRequired}
                type="url"
                value={draft.mediaUrl}
              />
            </label>
          </div>

          <label>
            Upload image
            <input
              accept="image/png,image/jpeg,image/webp,image/gif"
              name="mediaFile"
              onChange={(event) =>
                setLocalImageName(event.target.files?.[0]?.name ?? '')
              }
              type="file"
            />
          </label>

          <button
            className="primary-action"
            disabled={
              posting ||
              !draft.caption.trim() ||
              draft.channels.length === 0 ||
              missingRequiredMedia
            }
            type="submit"
          >
            {posting ? <RefreshCw /> : <Send />}
            Post now
          </button>
        </form>
      </article>

      <aside className="social-side">
        <article className="surface">
          <SectionHeading
            icon={<CheckCircle2 />}
            title="Graph setup"
            value={config?.facebook || config?.instagram ? 'Ready' : 'Connect'}
          />
          <div className="meta-connect-actions">
            <button
              className="secondary-action"
              onClick={() => {
                window.location.href = '/api/meta/auth/start'
              }}
              type="button"
            >
              <Share2 />
              Connect Page
            </button>
            <button
              className="secondary-action"
              onClick={() => {
                window.location.href = '/api/meta/auth/start?mode=publish'
              }}
              type="button"
            >
              <Send />
              Enable Posting
            </button>
            <button
              className="icon-action"
              onClick={() => void loadMetaStatus()}
              title="Refresh Meta connection"
              type="button"
            >
              <RefreshCw />
            </button>
          </div>
          {config?.pages.length ? (
            <label className="page-select">
              Page
              <select
                onChange={(event) =>
                  void selectConnectedPage(event.target.value)
                }
                value={config.selectedPageId}
              >
                {config.pages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.name}
                    {page.instagramBusinessAccount?.username
                      ? ` / @${page.instagramBusinessAccount.username}`
                      : ''}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <EmptyState label="Connect Meta to choose a Facebook Page and linked Instagram account." />
          )}
          <div className="setup-grid">
            <div className={config?.facebook ? 'setup-item ready' : 'setup-item'}>
              <Share2 />
              <strong>Facebook</strong>
              <span>{config?.facebookStatus ?? 'Checking setup'}</span>
            </div>
            <div
              className={config?.instagram ? 'setup-item ready' : 'setup-item'}
            >
              <Camera />
              <strong>Instagram</strong>
              <span>{config?.instagramStatus ?? 'Checking setup'}</span>
            </div>
          </div>
        </article>

        <article className="surface">
          <SectionHeading
            icon={<AtSign />}
            title="X setup"
            value={xConfig?.connected ? 'Ready' : 'Connect'}
          />
          <div className="meta-connect-actions x-connect-actions">
            <button
              className="secondary-action"
              onClick={() => {
                window.location.href = '/api/x/auth/start'
              }}
              type="button"
            >
              <AtSign />
              Connect X
            </button>
            <button
              className="icon-action"
              onClick={() => void loadXStatus()}
              title="Refresh X connection"
              type="button"
            >
              <RefreshCw />
            </button>
          </div>
          <div className="setup-grid x-setup-grid">
            <div className={xConfig?.connected ? 'setup-item ready' : 'setup-item'}>
              <AtSign />
              <strong>X</strong>
              <span>{xConfig?.status ?? 'Checking setup'}</span>
            </div>
          </div>
        </article>

        <article className="surface">
          <SectionHeading
            icon={<MessageSquareText />}
            title="Content pillars"
            value={`${socialContentPillars.length} angles`}
          />
          <div className="pillar-list">
            {socialContentPillars.map((pillar) => (
              <button
                className="pillar-button"
                key={pillar}
                onClick={() =>
                  onChange({
                    ...draft,
                    campaign: pillar,
                    caption: draft.caption || `${pillar}: `,
                  })
                }
                type="button"
              >
                {pillar}
              </button>
            ))}
          </div>
        </article>

        <article className="surface preview-surface">
          <SectionHeading icon={<Image />} title="Preview" value={draft.postType} />
          <div className="post-preview">
            <div>
              <strong>{draft.campaign || 'Campaign'}</strong>
              <span>
                {draft.channels.length > 0
                  ? draft.channels.join(' + ')
                  : 'No channel selected'}
              </span>
            </div>
            <p>{draft.caption || 'Post copy will preview here.'}</p>
            {draft.mediaUrl && (
              <span className="preview-asset">
                <Image />
                Media attached
              </span>
            )}
            {localImageName && (
              <span className="preview-asset">
                <Image />
                {localImageName}
              </span>
            )}
            {draft.linkUrl && (
              <span className="preview-asset">
                <Link />
                Link attached
              </span>
            )}
          </div>
        </article>

        <article className="surface">
          <SectionHeading
            icon={<CalendarDays />}
            title="Recent social posts"
            value={`${history.length} sent`}
          />
          {history.length === 0 ? (
            <EmptyState label="Published posts will appear here this session." />
          ) : (
            <div className="compact-list">
              {history.slice(0, 5).map((post) => (
                <div key={post.id}>
                  <strong>{post.channels.join(' + ')}</strong>
                  <span>{post.postedAt}</span>
                </div>
              ))}
            </div>
          )}
        </article>
      </aside>
    </section>
  )
}
