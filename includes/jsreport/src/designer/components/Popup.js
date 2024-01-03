import classNames from 'classnames/dedupe';

class Popup {

  static defaultProps = {
    arrow: 'top',
    placement: 'bottom',
    align: 'left'
  }

  constructor(props) {
    this.props = {
      ...Popup.defaultProps,
      ...props
    };
    this.show();
  }

  render = () => {
    const { className, contentHtml, arrow, target, constrainTo, placement, align } = this.props;
    const div = document.createElement('div');
    div.className = `jsr-popup ${className || ''} jsr-popup-placement-${placement} jsr-popup-align-${align}`;
    div.innerHTML = `
      <div class="jsr-popup-content">
        ${contentHtml || ''}
      </div>
      <div class="jsr-popup-arrow jsr-popup-arrow-${arrow}"></div>
    `;
    document.body.appendChild(div);
    this.el = div;
    this.align();
    this.rendered = true;
    div.addEventListener('click', this.onClick);
    document.body.addEventListener('click', this.onBodyClick);
  }

  align = () => {
    const { className, contentHtml, arrow, target, constrainTo, placement, align } = this.props;
    const div = this.el;
    const box = div.getBoundingClientRect();
    const origWidth = box.width;
    const origHeight = box.height;
    const isAboveOrBelow = ['top', 'bottom'].indexOf(placement) >= 0;
    let top = 0;
    let left = 0;
    let width = 0;
    let height = 0;
    let arrowOffset = 15;
    const constrain = (constrainTo ? constrainTo.getBoundingClientRect() : {
      top: 0,
      left: 0,
      right: window.innerWidth - 10,
      bottom: window.innerHeight - 10
    });
    if (target) {
      const targetBox = target.getBoundingClientRect();
      switch (placement) {
        case 'bottom': 
          top = targetBox.bottom + 5;
          break;
        case 'right':
          left = targetBox.right + 5;
          top = targetBox.top;
          arrowOffset = (targetBox.height / 2) - 4;
          break;
      }
      switch (align) {
        case 'left':
          if (isAboveOrBelow) {
            arrowOffset = (targetBox.width / 2) - 4;
            left = targetBox.left;
          }
          break;
        case 'right':
          if (isAboveOrBelow) {
            left = targetBox.right - origWidth;
            arrowOffset = origWidth - (targetBox.width / 2) - 4;
          }
          break;
      }
    }
    div.style.top = `${(document.body.scrollTop || 0) + top}px`;
    div.style.left = `${(document.body.scrollLeft || 0) + left}px`;
    if (origHeight > constrain.height) {
      div.style.height = `${constrain.height}px`;
    }
    if (origWidth > constrain.width) {
      div.style.width = `${constrain.width}px`;
    }
    // TODO if align=right, move right edge first
    if (top + origHeight > constrain.bottom) {
      div.style.height = `${constrain.bottom - top}px`;
    }
    if (left + origWidth > constrain.right) {
      div.style.width = `${constrain.right - left}px`;
    }
    const arrowOffsetProp = isAboveOrBelow ? 'left' : 'top';
    div.querySelector('.jsr-popup-arrow').style[arrowOffsetProp] = `${arrowOffset}px`;
  }

  onClick = (evt) => {
    evt.stopPropagation();
  }

  onBodyClick = () => {
    if (this.visible) {
      this.hide();
    }
  }

  setVisible = (visible) => {
    this.el.className = classNames(this.el.className, {
      'jsr-popup-transitioning': true
    });
    setTimeout(() => {
      this.el.className = classNames(this.el.className, {
        'jsr-popup-visible': visible
      });    
      setTimeout(() => {
        this.el.className = classNames(this.el.className, {
          'jsr-popup-transitioning': false
        });
      }, 200);
      this.visible = visible;
    }, 0);
  }

  show = (target) => {
    if (!this.rendered) {
      this.render();
    }
    if (target) {
      this.props.target = target;
    }
    this.align();
    this.setVisible(true);
    if (this.props.onShow) this.props.onShow();
  }

  hide = () => {
    this.setVisible(false);
    if (this.props.onHide) this.props.onHide();
  }

};

export default Popup;
