/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 **/
import formatCurrency from 'lib/format-currency';

class PlanFeaturesSummary extends Component {
	static propTypes = {
		available: PropTypes.bool.isRequired,
		planTitle: PropTypes.string.isRequired,
	};

	render() {
		const {
			available,
			currencyCode,
			current,
			currentPlanTitle,
			discountPrice,
			planTitle,
			rawPrice,
			relatedMonthlyPlan,
			site,
		} = this.props;
		const isJetpackSite = !! site.jetpack;

		let monthlyPrice, yearlyPrice, discountYearlyPrice;

		if ( ! current && ! available ) {
			return null;
		}

		if ( isJetpackSite ) {
			if ( relatedMonthlyPlan ) {
				yearlyPrice = relatedMonthlyPlan.raw_price * 12;
				discountYearlyPrice = rawPrice;
			} else {
				monthlyPrice = rawPrice;
				yearlyPrice = rawPrice * 12;
			}
		} else {
			monthlyPrice = rawPrice;
			yearlyPrice = rawPrice * 12;
			discountYearlyPrice = discountPrice * 12;
		}

		return (
			<div className="plan-features__summary">
				<strong className="plan-features__summary-title">
					{ current ? 'Plan summary' : 'Credit summary' }
				</strong>
				<div className="plan-features__summary-price-row">
					<span className="plan-features__summary-item">{ planTitle } Plan</span>
					<span className="plan-features__summary-price">
						{ formatCurrency( yearlyPrice, currencyCode ) }
					</span>
					{ monthlyPrice && (
						<div className="plan-features__summary-price-desc">
							({ formatCurrency( monthlyPrice, currencyCode ) } x 12 months)
						</div>
					) }
				</div>
				{ !! discountYearlyPrice && (
					<div className="plan-features__summary-price-row plan-features__summary-discount">
						<span className="plan-features__summary-item">
							{ isJetpackSite ? 'Jetpack credits' : `${ currentPlanTitle } Plan credits` }
						</span>
						<span className="plan-features__summary-price">
							{ formatCurrency( discountYearlyPrice - yearlyPrice, currencyCode ) }
						</span>
					</div>
				) }
				<div className="plan-features__summary-price-row plan-features__summary-total">
					<span className="plan-features__summary-item">Total</span>
					<span className="plan-features__summary-price">
						{ formatCurrency( discountYearlyPrice || yearlyPrice, currencyCode ) }
					</span>
				</div>
				{ ! current && (
					<div className="plan-features__summary-policy">30-day money-back gurantee included</div>
				) }
			</div>
		);
	}
}

export default localize( PlanFeaturesSummary );
