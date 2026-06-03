import React from 'react';
import { ControlGuide as ControlGuideType, FullySupportedTechnique, LimitedTechnique, UnavailableTechnique } from '@/lib/controlGuideData';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface ControlGuideProps {
  guide: ControlGuideType;
}

export const ControlGuide: React.FC<ControlGuideProps> = ({ guide }) => {
  const renderTechniqueName = (
    tech: FullySupportedTechnique | LimitedTechnique | UnavailableTechnique
  ) => {
    return (
      <p className="control-guide-tech-name">
        {tech.name}
        <span className="control-guide-name-command">{tech.notation}</span>
      </p>
    );
  };

  const getSuitabilityLabel = (rating: string) => {
    const labels: Record<string, string> = {
      very_high: '非常に高い',
      high: '高い',
      moderate: '中程度',
      low: '低い'
    };
    return labels[rating] || rating;
  };

  const getSuitabilityColor = (rating: string) => {
    const colors: Record<string, string> = {
      very_high: 'very-high',
      high: 'high',
      moderate: 'moderate',
      low: 'low'
    };
    return colors[rating] || 'moderate';
  };

  return (
    <div className="control-guide-container">
      {/* モダン適性サマリー */}
      <div className={`control-guide-summary ${getSuitabilityColor(guide.modernSuitability.rating)}`}>
        <div className="flex items-start gap-4">
          <CheckCircle className="control-guide-summary-icon w-6 h-6 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3>
              モダン操作適性：{getSuitabilityLabel(guide.modernSuitability.rating)}
            </h3>
            <p>{guide.modernSuitability.summary}</p>
            
            {guide.modernSuitability.concerns.length > 0 && (
              <div className="control-guide-concerns">
                <p className="control-guide-concern-title">
                  <AlertTriangle className="w-4 h-4" />
                  懸念点
                </p>
                <ul>
                  {guide.modernSuitability.concerns.map((concern, idx) => (
                    <li key={idx}>
                      {concern}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 使用不可技 */}
      {(guide.unavailableInModern.normals.length > 0 || guide.unavailableInModern.specials.length > 0) && (
        <div className="control-guide-section mb-8">
          <h3 className="control-guide-section-title flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500" />
            モダン操作で使用不可の技
          </h3>
          
          {guide.unavailableInModern.normals.length > 0 && (
            <div className="mb-6">
              <h4 className="control-guide-group-title">通常技</h4>
              <div className="space-y-3">
                {guide.unavailableInModern.normals.map((tech, idx) => (
	                  <div key={idx} className="control-guide-tech-card unavailable">
	                    <div className="control-guide-tech-row">
	                      <div className="control-guide-tech-body">
	                        {renderTechniqueName(tech)}
	                        <p className="control-guide-tech-description">{tech.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {guide.unavailableInModern.specials.length > 0 && (
            <div>
              <h4 className="control-guide-group-title">特殊技</h4>
              <div className="space-y-3">
                {guide.unavailableInModern.specials.map((tech, idx) => (
	                  <div key={idx} className="control-guide-tech-card unavailable">
	                    <div className="control-guide-tech-row">
	                      <div className="control-guide-tech-body">
	                        {renderTechniqueName(tech)}
	                        <p className="control-guide-tech-description">{tech.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 制限がある技 */}
      {guide.limitedInModern.length > 0 && (
        <div className="control-guide-section mb-8">
          <h3 className="control-guide-section-title flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            モダン操作で制限がある技
          </h3>
          
          <div className="space-y-4">
            {guide.limitedInModern.map((tech, idx) => (
	              <div key={idx} className="control-guide-tech-card limited">
	                <div className="control-guide-tech-row">
	                  <div className="control-guide-tech-body">
	                    {renderTechniqueName(tech)}
	                    <p className="control-guide-tech-description">{tech.description}</p>
                  </div>
                </div>
                
                <div className="control-guide-version-grid">
                  <div>
                    <p className="control-guide-version-title">クラシック操作</p>
                    <div className="control-guide-chip-row">
                      {tech.classicVersions.map((v, i) => (
                        <div key={i} className="control-guide-chip classic">
                          {v}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="control-guide-version-title">モダン操作</p>
                    <div className="control-guide-chip-row">
                      {tech.modernVersions.map((v, i) => (
                        <div key={i} className="control-guide-chip modern">
                          {v}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="control-guide-limitation">
                  <p>制限内容</p>
                  <span>{tech.limitation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 完全対応の必殺技 */}
      {guide.fullySupportedSpecials.length > 0 && (
        <div className="control-guide-section mb-8">
          <h3 className="control-guide-section-title flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            モダン操作で完全対応の技
          </h3>
          
          <div className="space-y-3">
            {guide.fullySupportedSpecials.map((tech, idx) => (
	              <div key={idx} className="control-guide-tech-card supported">
	                <div className="control-guide-tech-row">
	                  <div className="control-guide-tech-body">
	                    {renderTechniqueName(tech)}
	                    <p className="control-guide-tech-description">{tech.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 補足情報 */}
      {guide.notes.length > 0 && (
        <div className="control-guide-section">
          <h3 className="control-guide-section-title mb-4">補足情報</h3>
          
          <div className="control-guide-notes">
            <ul>
              {guide.notes.map((note, idx) => (
                <li key={idx}>
                  <span>•</span>
                  <p>{note}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
