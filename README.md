# mmap
openlayers+vue+antdesign+vant

# 后端未给出,前后端都使用的自己改造过的的jeecgboot
# 部分URL gis数据等敏感数据使用 ****代替或者进行了删除,请自行判断


# 有朋友对点击高亮那边有问题,我把我这debug的截图放出来
- debug截图:
  ![image](https://user-images.githubusercontent.com/58463221/123920299-62385180-d9b8-11eb-9748-355dcf38061c.png)
  描述: 上图是截取了部分,但是很明显能看到有feature id 是重复的,另外console的位置在:
  ```javascript
  style: (feature) => {
                console.log("======>     ")
                console.log(feature)
                console.log(feature.getId()+"         <======")
                if (feature.getId() in selection) {
                  //返回样式
                  return that.highlightStyle;
                }
              },
  ```

