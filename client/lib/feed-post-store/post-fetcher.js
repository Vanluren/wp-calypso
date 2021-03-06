/** @format */

/**
 * External dependencies
 */

import { assign, noop, pick, pickBy } from 'lodash';

/**
 * Internal Dependencies
 */
import { reduxGetState } from 'lib/redux-bridge';
import { getPostByKey } from 'state/reader/posts/selectors';

// @TODO: remove this when FeedPostStore is removed
// flux stores need at least one listener or else they won't listen to dispatched actions
// this make a nooop listener
import FeedPostStore from 'lib/feed-post-store';
FeedPostStore.on( 'change', () => {} );

function PostFetcher( options ) {
	assign(
		this,
		{
			onFetch: noop,
			onPostReceived: noop,
			onError: noop,
		},
		options
	);

	this.postsToFetch = new Set();
	this.batchQueued = false;
}

function toKey( o ) {
	return `${ o.feedId || '' }-${ o.blogId || '' }-${ o.postId || '' }`;
}

function fromKey( key ) {
	const [ feedId, blogId, postId ] = key.split( '-' ).map( Number );
	return pickBy(
		{
			feedId,
			blogId,
			postId,
		},
		value => value > 0
	);
}

assign( PostFetcher.prototype, {
	add: function( postKey ) {
		this.postsToFetch.add( toKey( pick( postKey, [ 'feedId', 'blogId', 'postId' ] ) ) );

		if ( ! this.batchQueued ) {
			this.batchQueued = setTimeout( this.run.bind( this ), 100 );
		}
	},

	remove: function( postKey ) {
		this.postsToFetch.delete( toKey( pick( postKey, [ 'feedId', 'blogId', 'postId' ] ) ) );
	},

	run: function() {
		const toFetch = this.postsToFetch;

		this.batchQueued = false;

		if ( toFetch.size === 0 ) {
			return;
		}

		toFetch.forEach( function( key ) {
			const postKey = fromKey( key );
			const post = getPostByKey( reduxGetState(), postKey );

			if ( post && post._state !== 'minimal' ) {
				return;
			}

			this.onFetch( postKey );

			this.makeRequest( postKey ).then(
				data => {
					this.onPostReceived( postKey.blogId || postKey.feedId, postKey.postId, data );
				},
				err => {
					this.onError( err, postKey );
				}
			);
		}, this );

		this.postsToFetch = new Set();
	},
} );

export default PostFetcher;
