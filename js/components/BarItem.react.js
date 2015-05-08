var React = require( 'react' );
var el = React.createElement;
var A = require( './Link.react' );
import { __ } from '../utils/l10n';
var icon = 'dashicons-before dashicons-';

module.exports = React.createClass( {
	render: function() {
		return (
			el( 'li', null,
				el( A, {
					href: this.props.href == null ? this.props.text.toLowerCase() : this.props.href,
					className: icon + ( this.props.icon || 'admin-' + this.props.text.toLowerCase() )
				},
					__( this.props.text )
				)
			)
		);
	}
} );
