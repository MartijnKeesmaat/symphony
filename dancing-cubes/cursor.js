// Follow real cursor
const CURSOR = document.querySelector('.cursor');
const BODY = document.querySelector('body');

BODY.addEventListener('mousemove', cursorFollow, false);

function cursorFollow(e) {
  const WIDTH = CURSOR.offsetWidth / 2,
    HEIGHT = CURSOR.offsetHeight / 2,
    Y = e.pageY - WIDTH,
    X = e.pageX - HEIGHT;

  CURSOR.style.transform = 'translateY(' + Y + 'px) translateX(' + X + 'px)';
}

// Cursor growth over links
let noCursorList = [];
const LINKS = document.querySelectorAll('a');

LINKS.forEach(function(elem) {
  elem.addEventListener('mouseenter', cursorOverLink, false);
  elem.addEventListener('mouseleave', cursorAwayLink, false);
});

function cursorOverLink() {
  CURSOR.classList.add('cursor--link-hover');
}
function cursorAwayLink() {
  CURSOR.classList.remove('cursor--link-hover');
}

// Click feedback
BODY.addEventListener('click', cursorClick, false);

function cursorClick() {
  CURSOR.classList.remove('cursor--click');
  void CURSOR.offsetWidth;
  CURSOR.classList.add('cursor--click');
}

// Remove if cursor is out window
document.addEventListener('mouseenter', cursorInWindow, false);
document.addEventListener('mouseleave', cursorOutWindow, false);
function cursorOutWindow() {
  CURSOR.classList.add('cursor--out-window');
}
function cursorInWindow() {
  CURSOR.classList.remove('cursor--out-window');
}
