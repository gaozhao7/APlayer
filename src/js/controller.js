import utils from './utils';
import Icons from './icons';

class Controller {
    constructor(player) {
        this.player = player;

        this.initPlayButton();
        this.initPlayBar();
        this.initOrderButton();
        this.initLoopButton();
        this.initMenuButton();
        if (!utils.isMobile) {
            this.initVolumeButton();
        }
        this.initMiniSwitcher();
        this.initCloseButton();
        this.initDrag();
        this.initSkipButton();
        this.initLrcButton();
        this.initSpeedButton();
    }

    initPlayButton() {
        this.player.template.pic.addEventListener('click', () => {
            if (!this.dragged) {
                this.player.toggle();
            }
            this.dragged = false;
        });
    }

    initPlayBar() {
        const thumbMove = (e) => {
            let percentage = ((e.clientX || e.changedTouches[0].clientX) - this.player.template.barWrap.getBoundingClientRect().left) / this.player.template.barWrap.clientWidth;
            percentage = Math.max(percentage, 0);
            percentage = Math.min(percentage, 1);
            this.player.bar.set('played', percentage, 'width');
            this.player.lrc && this.player.lrc.update(percentage * this.player.duration);
            this.player.template.ptime.innerHTML = utils.secondToTime(percentage * this.player.duration);
        };

        const thumbUp = (e) => {
            document.removeEventListener(utils.nameMap.dragEnd, thumbUp);
            document.removeEventListener(utils.nameMap.dragMove, thumbMove);
            let percentage = ((e.clientX || e.changedTouches[0].clientX) - this.player.template.barWrap.getBoundingClientRect().left) / this.player.template.barWrap.clientWidth;
            percentage = Math.max(percentage, 0);
            percentage = Math.min(percentage, 1);
            this.player.bar.set('played', percentage, 'width');
            this.player.seek(percentage * this.player.duration);
            this.player.disableTimeupdate = false;
        };

        this.player.template.barWrap.addEventListener(utils.nameMap.dragStart, () => {
            this.player.disableTimeupdate = true;
            document.addEventListener(utils.nameMap.dragMove, thumbMove);
            document.addEventListener(utils.nameMap.dragEnd, thumbUp);
        });
    }

    initVolumeButton() {
        this.player.template.volumeButton.addEventListener('click', () => {
            if (this.player.audio.muted) {
                this.player.volume(this.player.audio.volume, true);
            } else {
                this.player.audio.muted = true;
                this.player.switchVolumeIcon();
                this.player.bar.set('volume', 0, 'height');
            }
        });

        const thumbMove = (e) => {
            let percentage = 1 - ((e.clientY || e.changedTouches[0].clientY) - this.player.template.volumeBar.getBoundingClientRect().top) / this.player.template.volumeBar.clientHeight;
            percentage = Math.max(percentage, 0);
            percentage = Math.min(percentage, 1);
            this.player.volume(percentage);
        };

        const thumbUp = (e) => {
            this.player.template.volumeBarWrap.classList.remove('aplayer-volume-bar-wrap-active');
            document.removeEventListener(utils.nameMap.dragEnd, thumbUp);
            document.removeEventListener(utils.nameMap.dragMove, thumbMove);
            let percentage = 1 - ((e.clientY || e.changedTouches[0].clientY) - this.player.template.volumeBar.getBoundingClientRect().top) / this.player.template.volumeBar.clientHeight;
            percentage = Math.max(percentage, 0);
            percentage = Math.min(percentage, 1);
            this.player.volume(percentage);
        };

        this.player.template.volumeBarWrap.addEventListener(utils.nameMap.dragStart, () => {
            this.player.template.volumeBarWrap.classList.add('aplayer-volume-bar-wrap-active');
            document.addEventListener(utils.nameMap.dragMove, thumbMove);
            document.addEventListener(utils.nameMap.dragEnd, thumbUp);
        });
    }

    initOrderButton() {
        this.player.template.order.addEventListener('click', () => {
            if (this.player.options.order === 'list') {
                this.player.options.order = 'random';
                this.player.template.order.innerHTML = Icons.orderRandom;
            } else if (this.player.options.order === 'random') {
                this.player.options.order = 'list';
                this.player.template.order.innerHTML = Icons.orderList;
            }
        });
    }

    initLoopButton() {
        this.player.template.loop.addEventListener('click', () => {
            if (this.player.list.audios.length > 1) {
                if (this.player.options.loop === 'one') {
                    this.player.options.loop = 'none';
                    this.player.template.loop.innerHTML = Icons.loopNone;
                } else if (this.player.options.loop === 'none') {
                    this.player.options.loop = 'all';
                    this.player.template.loop.innerHTML = Icons.loopAll;
                } else if (this.player.options.loop === 'all') {
                    this.player.options.loop = 'one';
                    this.player.template.loop.innerHTML = Icons.loopOne;
                }
            } else {
                if (this.player.options.loop === 'one' || this.player.options.loop === 'all') {
                    this.player.options.loop = 'none';
                    this.player.template.loop.innerHTML = Icons.loopNone;
                } else if (this.player.options.loop === 'none') {
                    this.player.options.loop = 'all';
                    this.player.template.loop.innerHTML = Icons.loopAll;
                }
            }
        });
    }

    initMenuButton() {
        this.player.template.menu.addEventListener('click', () => {
            this.player.list.toggle();
        });
    }

    initMiniSwitcher() {
        this.player.template.miniSwitcher.addEventListener('click', () => {
            this.player.setMode(this.player.mode === 'mini' ? 'normal' : 'mini');
        });
    }

    initCloseButton() {
        if (!this.player.template.closeButton) {
            return;
        }
        const hideHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.player.hide();
        };
        this.player.template.closeButton.addEventListener('click', hideHandler);
        this.player.template.closeButton.addEventListener(utils.nameMap.dragStart, hideHandler);
    }

    initDrag() {
        if (!this.player.options.fixed) {
            return;
        }
        const pic = this.player.template.pic;
        const body = this.player.template.body;
        const list = this.player.template.list;
        const lrcWrap = this.player.template.lrcWrap;

        pic.addEventListener(utils.nameMap.dragStart, (e) => {
            e.preventDefault();
            const startY = e.clientY || e.touches[0].clientY;
            const startBottom = parseInt(getComputedStyle(body).bottom, 10);

            const moveHandler = (e2) => {
                const currentY = e2.clientY || e2.touches[0].clientY;
                const delta = startY - currentY;
                if (Math.abs(delta) > 3) {
                    this.dragged = true;
                }
                const newBottom = Math.min(window.innerHeight - 66, Math.max(0, startBottom + delta));
                body.style.bottom = newBottom + 'px';
                list.style.marginBottom = newBottom + 65 + 'px';
                if (lrcWrap) {
                    lrcWrap.style.bottom = newBottom + 10 + 'px';
                }
            };

            const upHandler = () => {
                document.removeEventListener(utils.nameMap.dragMove, moveHandler);
                document.removeEventListener(utils.nameMap.dragEnd, upHandler);
            };

            document.addEventListener(utils.nameMap.dragMove, moveHandler);
            document.addEventListener(utils.nameMap.dragEnd, upHandler);
        });
    }

    initSkipButton() {
        this.player.template.skipBackButton.addEventListener('click', () => {
            this.player.skipBack();
        });
        this.player.template.skipForwardButton.addEventListener('click', () => {
            this.player.skipForward();
        });
        this.player.template.skipPlayButton.addEventListener('click', () => {
            this.player.toggle();
        });
    }

    initLrcButton() {
        this.player.template.lrcButton.addEventListener('click', () => {
            if (this.player.template.lrcButton.classList.contains('aplayer-icon-lrc-inactivity')) {
                this.player.template.lrcButton.classList.remove('aplayer-icon-lrc-inactivity');
                this.player.lrc && this.player.lrc.show();
            } else {
                this.player.template.lrcButton.classList.add('aplayer-icon-lrc-inactivity');
                this.player.lrc && this.player.lrc.hide();
            }
        });
    }

    initSpeedButton() {
        const speedBarWrap = this.player.template.speedButton.parentNode;

        this.player.template.speedButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            speedBarWrap.classList.toggle('aplayer-speed-wrap-active');
        });

        for (let i = 0; i < this.player.template.speedItems.length; i++) {
            this.player.template.speedItems[i].addEventListener('click', () => {
                const speed = parseFloat(this.player.template.speedItems[i].textContent);
                this.player.speed(speed);

                // Update active state
                for (let j = 0; j < this.player.template.speedItems.length; j++) {
                    this.player.template.speedItems[j].classList.remove('aplayer-speed-item-active');
                }
                this.player.template.speedItems[i].classList.add('aplayer-speed-item-active');

                // Close the speed bar
                speedBarWrap.classList.remove('aplayer-speed-wrap-active');
            });
        }

        // Close speed bar when clicking outside
        document.addEventListener('click', (e) => {
            if (!speedBarWrap.contains(e.target)) {
                speedBarWrap.classList.remove('aplayer-speed-wrap-active');
            }
        });
    }
}

export default Controller;
