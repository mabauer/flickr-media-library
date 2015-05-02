( function( window, $, undefined ) {
	'use strict';

	$.fn.newGuid = function() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
			function(c) {
				var r = Math.random() * 16 | 0,
				v = c == 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			}).toUpperCase();
	};

	function CSSCropObject($img) {
		var self = this;

		//this.targetWidth  = parseInt($img.attr('data-csscrop_width'));
		//this.targetHeight = parseInt($img.attr('data-csscrop_height'));
		this.targetRatio  = parseFloat($img.attr('data-csscrop_ratio'));
		this.targetMethod = $img.attr('data-csscrop_method');
		// bowing to the responsive design gods, we will assume the width is the width is the width
		this.$img         = $img;
		this.$imgTemplate = $img.clone(true); //because we will be adding css to the real thing
		this.$cropDiv     = null;
		this.$origParent  = $img.parent();
		this.resizeAdded  = false;

		this.crop = function() {
			var imgWidth = this.$img.width();
			this.$cropDiv = $('<div>').css({
				'position' : 'relative',
				'overflow' : 'hidden',
				'width'    : imgWidth+'px',
				'height'   : parseInt(imgWidth / this.targetRatio )+'px',
				'max-width': '100%'
			});

			// insert the div between the image and it's direct parent
			this.$img.css( this._computeImgCss() ).detach();
			this.$cropDiv.append(this.$img);
			this.$origParent.append(this.$cropDiv);

			// bind refresh to resize event (one time)
			if ( !this.resizeAdded ) {
				$(window).resize( this.windowResized );
				this.resizeAdded = true;
			}
		};
		this.refresh = function() {
			// put everything back where it belongs
			this.$cropDiv.remove();
			this.$img = this.$imgTemplate.clone(true);
			this.$origParent.append(this.$img);

			// call picturefill if necessary
			if (window.picturefill) {
				window.picturefill( this.$img );
			}

			// re-run crop
			this.crop();
		};
		var resizeTimer;
		this.windowResized = function(event) {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(function() {
				// this is a window, self is the cropobject
				self.refresh();
			}, 200);
		};
		this._computeImgCss = function() {
			var css = {'position': 'absolute'},
			    tw  = this.$cropDiv.width(),
			    th  = this.$cropDiv.height(),
                iw  = this.$img.width(),
                ih  = this.$img.height(),
                sm  = Math.min( ih/th, iw/tw ),
                scale = 1;
			// TODO add different methods here
            if ( sm > 1 ) {
	            // image is larger than bounding box
            	scale = 1/sm;
            	css.transform = 'scale('+scale+','+scale+')';
            	css['-ms-interpolation-mode'] = 'bicubic';
            } else if ( sm < 1 ) {
            	//image is smaller than bounding box
            	scale = 1/sm;
            	css.transform = 'scale('+scale+','+scale+')';
            	css['-ms-interpolation-mode'] = 'bicubic';
            }
            // center it in box
            // the first part adjusts for the scaling shift, the second part centers image
			css.left = parseInt(iw*(scale-1)/2 - (iw*scale-tw)/2)+'px';
			css.top = parseInt(ih*(scale-1)/2 - (ih*scale-th)/2)+'px';
			return css;
		};
	}

	function csscrop() {
		$('img.csscrop').each(function() {
			var $this = $(this);
			// check to see if already run, if so do nothing (TODO: call refresh)
			if ( $this.csscrop ) { return; }
			$this.csscrop = new CSSCropObject( $this );
			$this.csscrop.crop();
		});
	}

	/* onReady: Handle Settings page for Flickr Media Library. */
	$( function() {
		csscrop();
	});

} )( window, window.jQuery );