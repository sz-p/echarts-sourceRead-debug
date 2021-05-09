/**
 * @introduction 初始化主题
 *
 * @description 根据主题文件json初始化主题
 */

import defaultTheme from './default.json';

export const initTheme = function() {
	for (let key in defaultTheme) {
		document.documentElement.style.setProperty(
			`--${key.replace(/[A-Z]/g, function($s1) {
				return `-${$s1.toLowerCase()}`;
			})}`,
			defaultTheme[key]
		);
	}
};
