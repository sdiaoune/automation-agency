import { BarChart3, CheckCircle2, Plug, Tags } from 'lucide-react'
import {
  buildIntegrationInsights,
  integrationPlatforms,
} from './integrations'
import type { Prospect } from './types'
import { EmptyState, MetricCard, SectionHeading } from './SharedUi'

export function IntegrationsDashboard({
  prospects,
}: {
  prospects: Prospect[]
}) {
  const insights = buildIntegrationInsights(prospects)
  const taggedCount = insights.taggedProspects.length
  const mostCommon = insights.mostCommonPlatform

  return (
    <>
      <section className="metric-grid integration-metric-grid">
        <MetricCard
          current={integrationPlatforms.length}
          label="Supported platforms"
          target={integrationPlatforms.length}
          targetLabel={`${integrationPlatforms.length}`}
        />
        <MetricCard
          current={taggedCount}
          label="Tagged prospects"
          target={Math.max(prospects.length, 1)}
          targetLabel={`${prospects.length} accounts`}
        />
        <MetricCard
          current={insights.untaggedProspects.length}
          label="Needs review"
          target={Math.max(prospects.length, 1)}
          targetLabel="untagged"
        />
        <MetricCard
          current={mostCommon?.count ?? 0}
          label="Top platform"
          target={Math.max(mostCommon?.count ?? 1, 1)}
          targetLabel={mostCommon?.platform?.name ?? 'none yet'}
        />
      </section>

      <section className="integrations-layout">
        <article className="surface integrations-directory">
          <SectionHeading
            icon={<Plug />}
            title="Integrations"
            value={`${integrationPlatforms.length} available`}
          />
          <div className="integration-card-grid">
            {integrationPlatforms.map((platform) => (
              <article className="integration-card" key={platform.id}>
                <div className="integration-logo-wrap">
                  <img alt={`${platform.name} logo`} src={platform.logo} />
                </div>
                <div>
                  <h3>{platform.name}</h3>
                  <span>{platform.category}</span>
                </div>
                <p>{platform.description}</p>
                <strong>
                  <CheckCircle2 />
                  {platform.status}
                </strong>
              </article>
            ))}
          </div>
        </article>

        <aside className="integrations-side">
          <article className="surface">
            <SectionHeading
              icon={<BarChart3 />}
              title="Platform mix"
              value={`${taggedCount} tagged`}
            />
            {taggedCount === 0 ? (
              <EmptyState label="Tagged prospect platform counts will appear here." />
            ) : (
              <div className="platform-count-list">
                {integrationPlatforms.map((platform) => {
                  const count = insights.counts.get(platform.id) ?? 0
                  if (count === 0) return null

                  return (
                    <div className="platform-count-row" key={platform.id}>
                      <span>
                        <img alt="" src={platform.logo} />
                        {platform.name}
                      </span>
                      <strong>{count}</strong>
                    </div>
                  )
                })}
              </div>
            )}
          </article>

          <article className="surface">
            <SectionHeading
              icon={<Tags />}
              title="Review queue"
              value={`${insights.untaggedProspects.length} accounts`}
            />
            {insights.untaggedProspects.length === 0 ? (
              <EmptyState label="Every prospect has at least one platform tag." />
            ) : (
              <div className="compact-list">
                {insights.untaggedProspects.slice(0, 6).map((prospect) => (
                  <div key={prospect.id}>
                    <strong>{prospect.company_name}</strong>
                    <span>{prospect.market || prospect.source || 'Unsorted'}</span>
                  </div>
                ))}
              </div>
            )}
          </article>
        </aside>
      </section>
    </>
  )
}
