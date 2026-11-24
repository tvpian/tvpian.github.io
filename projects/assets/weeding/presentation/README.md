# Precision-weeding presentation excerpts

Source: [Tharun_video_demo_with_subtitles_final.mp4](https://drive.google.com/file/d/1IvKSo8U6aEWXKw8ucpV-9Hd1IqdPomFb/view?usp=sharing).

| Asset | Source interval | Content |
| --- | --- | --- |
| `kinesthetic-data-collection.mp4` | 2:12–2:26 | Hand-guided workspace sampling for the inverse-kinematics model |
| `weed-detection.mp4` | 1:18–1:30 | Detector output in the experimental plant bed |
| `gazebo-validation.mp4` | 3:36–3:50 | Manipulation sequence in Gazebo |
| `synthetic-data.jpg` | Frame at 0:45 | Collected samples, plant cutouts, soil backgrounds, and synthetic examples |

Clips retain the original playback speed. Audio is omitted. They are encoded as H.264 at 24 fps with a 960-pixel width and fast-start metadata. Posters use the frame three seconds into each excerpt.

The clips isolate the relevant camera or simulation panel from the presentation. The still retains the four visual stages at their original relative positions while excluding the slide title, labels, and subtitle.

The teaching clip records gripper pose and joint angles for inverse-kinematics workspace data. It should not be described as a task-imitation learning demonstration.

## Re-create the clips

Given the downloaded source at `presentation.mp4`, run FFmpeg with these settings:

```sh
ffmpeg -ss 132 -i presentation.mp4 -t 14 -vf 'crop=1492:1260:1308:466,scale=960:-2,fps=24' -an -c:v libx264 -crf 25 -preset medium -pix_fmt yuv420p -movflags +faststart kinesthetic-data-collection.mp4
ffmpeg -ss 78 -i presentation.mp4 -t 12 -vf 'crop=1440:790:2090:766,scale=960:-2,fps=24' -an -c:v libx264 -crf 25 -preset medium -pix_fmt yuv420p -movflags +faststart weed-detection.mp4
ffmpeg -ss 216 -i presentation.mp4 -t 14 -vf 'crop=2268:990:1532:798,scale=960:-2,fps=24' -an -c:v libx264 -crf 25 -preset medium -pix_fmt yuv420p -movflags +faststart gazebo-validation.mp4
```

Crop coordinates refer to the 3840 × 2160 original. The still uses source rectangles `(80, 428, 2600, 1720)` and `(2660, 428, 3800, 1908)`, placed at `(0, 0)` and `(2580, 0)` on a black 3720 × 1480 canvas and resized to 1440 × 573.
