import i18n from '@dhis2/d2-i18n'
import { Tooltip, IconInfo16 } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { formatWithSeparator } from '../../util/numbers.js'
import { useCachedData } from '../cachedDataProvider/CachedDataProvider.jsx'
import styles from './styles/LegendDataQuality.module.css'

// Plugin legends use a plain title attribute instead of the styled Tooltip.
const InfoIcon = ({ content, isPlugin }) =>
    isPlugin ? (
        <span className={styles.infoIcon} title={content}>
            <IconInfo16 />
        </span>
    ) : (
        <Tooltip content={content}>
            <span className={styles.infoIcon}>
                <IconInfo16 />
            </span>
        </Tooltip>
    )

InfoIcon.propTypes = {
    content: PropTypes.string.isRequired,
    isPlugin: PropTypes.bool,
}

const LegendDataQuality = ({
    eventsWithoutCoordinatesCount,
    eventsOutsideOrgUnitsCount,
    orgUnitsWithoutBoundaryCount,
    orgUnitsTotalCount,
    orgUnitsWithoutCoordinatesCount,
    orgUnitsPointOnly = false,
    isPlugin = false,
}) => {
    const {
        systemSettings: { keyAnalysisDigitGroupSeparator },
    } = useCachedData()

    const hasOrgUnitsBoundaryData =
        typeof orgUnitsWithoutBoundaryCount === 'number' &&
        typeof orgUnitsTotalCount === 'number'

    const allOrgUnitsWithoutBoundary =
        hasOrgUnitsBoundaryData &&
        orgUnitsWithoutBoundaryCount === orgUnitsTotalCount

    const hasOrgUnitsWithoutBoundaryDetail =
        hasOrgUnitsBoundaryData && !allOrgUnitsWithoutBoundary

    if (
        typeof eventsWithoutCoordinatesCount !== 'number' &&
        typeof eventsOutsideOrgUnitsCount !== 'number' &&
        !hasOrgUnitsBoundaryData &&
        typeof orgUnitsWithoutCoordinatesCount !== 'number'
    ) {
        return null
    }

    return (
        <div className={styles.dataQuality}>
            <div>{i18n.t('Data quality')}</div>
            {typeof eventsWithoutCoordinatesCount === 'number' && (
                <div>
                    {eventsWithoutCoordinatesCount === 0
                        ? i18n.t('All events have coordinates')
                        : i18n.t('{{n}} event without coordinates', {
                              count: eventsWithoutCoordinatesCount,
                              n: formatWithSeparator(
                                  eventsWithoutCoordinatesCount,
                                  keyAnalysisDigitGroupSeparator
                              ),
                              defaultValue_plural:
                                  '{{n}} events without coordinates',
                          })}
                </div>
            )}
            {typeof eventsOutsideOrgUnitsCount === 'number' && (
                <div>
                    {eventsOutsideOrgUnitsCount === 0
                        ? i18n.t('All events within org unit boundaries')
                        : i18n.t('{{n}} event outside org unit boundaries', {
                              count: eventsOutsideOrgUnitsCount,
                              n: formatWithSeparator(
                                  eventsOutsideOrgUnitsCount,
                                  keyAnalysisDigitGroupSeparator
                              ),
                              defaultValue_plural:
                                  '{{n}} events outside org unit boundaries',
                          })}
                    {hasOrgUnitsWithoutBoundaryDetail && (
                        <InfoIcon
                            content={i18n.t(
                                '{{n}} of {{total}} org unit without boundaries',
                                {
                                    count: orgUnitsWithoutBoundaryCount,
                                    n: formatWithSeparator(
                                        orgUnitsWithoutBoundaryCount,
                                        keyAnalysisDigitGroupSeparator
                                    ),
                                    total: formatWithSeparator(
                                        orgUnitsTotalCount,
                                        keyAnalysisDigitGroupSeparator
                                    ),
                                    defaultValue_plural:
                                        '{{n}} of {{total}} org units without boundaries',
                                }
                            )}
                            isPlugin={isPlugin}
                        />
                    )}
                </div>
            )}
            {allOrgUnitsWithoutBoundary && (
                <div>
                    {i18n.t('Boundary check skipped')}
                    <InfoIcon
                        content={i18n.t('All org units without boundaries')}
                        isPlugin={isPlugin}
                    />
                </div>
            )}
            {typeof orgUnitsWithoutCoordinatesCount === 'number' && (
                <div>
                    {(() => {
                        if (orgUnitsWithoutCoordinatesCount === 0) {
                            return orgUnitsPointOnly
                                ? i18n.t('All org units have a point location')
                                : i18n.t('All org units have coordinates')
                        }
                        return orgUnitsPointOnly
                            ? i18n.t(
                                  '{{n}} org unit without a point location',
                                  {
                                      count: orgUnitsWithoutCoordinatesCount,
                                      n: formatWithSeparator(
                                          orgUnitsWithoutCoordinatesCount,
                                          keyAnalysisDigitGroupSeparator
                                      ),
                                      defaultValue_plural:
                                          '{{n}} org units without a point location',
                                  }
                              )
                            : i18n.t('{{n}} org unit without coordinates', {
                                  count: orgUnitsWithoutCoordinatesCount,
                                  n: formatWithSeparator(
                                      orgUnitsWithoutCoordinatesCount,
                                      keyAnalysisDigitGroupSeparator
                                  ),
                                  defaultValue_plural:
                                      '{{n}} org units without coordinates',
                              })
                    })()}
                </div>
            )}
        </div>
    )
}

LegendDataQuality.propTypes = {
    eventsOutsideOrgUnitsCount: PropTypes.number,
    eventsWithoutCoordinatesCount: PropTypes.number,
    isPlugin: PropTypes.bool,
    orgUnitsPointOnly: PropTypes.bool,
    orgUnitsTotalCount: PropTypes.number,
    orgUnitsWithoutBoundaryCount: PropTypes.number,
    orgUnitsWithoutCoordinatesCount: PropTypes.number,
}

export default LegendDataQuality
