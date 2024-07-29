package team.devs.devhub.domain.personalproject.dto;

import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Setter
public class PersonalProjectInitRequest {

    private Long projectId;
    private List<MultipartFile> files;
    private String commitMessage;

}
